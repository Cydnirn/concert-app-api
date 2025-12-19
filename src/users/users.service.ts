import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from 'src/dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(userDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userDto);
    return this.userRepository.save(user);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: string, userDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, userDto);
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.remove(user);
  }
}
