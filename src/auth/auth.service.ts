import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Session } from './session.entity';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,

    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    // In production, you should hash the password with bcrypt
    // For now, comparing plain text (you should implement proper hashing)
    if (user.password !== password) {
      return null;
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate access token (JWT) with 60 seconds expiry
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '60s',
        secret:
          this.configService.get<string>('JWT_SECRET') || 'default-secret-key',
      },
    );

    // Generate session token (refresh token) with 10 days expiry
    const sessionToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 10); // 10 days from now

    // Save session to database
    const session = this.sessionRepository.create({
      token: sessionToken,
      userId: user.id,
      expiresAt,
    });
    await this.sessionRepository.save(session);

    return {
      accessToken,
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refresh(sessionToken: string) {
    const session = await this.sessionRepository.findOne({
      where: { token: sessionToken },
      relations: ['user'],
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session token');
    }

    if (new Date() > session.expiresAt) {
      // Session expired, delete it
      await this.sessionRepository.remove(session);
      throw new UnauthorizedException('Session expired');
    }

    const user = session.user;

    // Generate new access token
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '60s',
        secret:
          this.configService.get<string>('JWT_SECRET') || 'default-secret-key',
      },
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(sessionToken: string) {
    const session = await this.sessionRepository.findOne({
      where: { token: sessionToken },
    });

    if (session) {
      await this.sessionRepository.remove(session);
    }

    return { message: 'Logged out successfully' };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'default-secret-key',
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // Clean up expired sessions (can be called by a cron job)
  async cleanupExpiredSessions() {
    const expiredSessions = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.expiresAt < :now', { now: new Date() })
      .getMany();

    if (expiredSessions.length > 0) {
      await this.sessionRepository.remove(expiredSessions);
    }

    return { deleted: expiredSessions.length };
  }
}
