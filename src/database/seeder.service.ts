import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Concert } from '../concert/concert.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Concert)
    private concertRepository: Repository<Concert>,
  ) {}

  async seed() {
    await this.seedAdmin();
    await this.seedConcert();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@example.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping...');
      return;
    }

    const admin = this.userRepository.create({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin123', // In production, this should be hashed with bcrypt
      role: 'admin',
    });

    await this.userRepository.save(admin);
    this.logger.log('Admin user created successfully');
    this.logger.log(`Email: ${adminEmail}`);
    this.logger.log('Password: admin123');
  }

  private async seedConcert() {
    const existingConcerts = await this.concertRepository.count();

    if (existingConcerts > 0) {
      this.logger.log('Concerts already exist, skipping...');
      return;
    }

    // Create 10 concert entries representing 10 tickets
    const concerts = [];
    const concertDate = new Date('2024-12-31T20:00:00Z');

    for (let i = 1; i <= 10; i++) {
      const concert = this.concertRepository.create({
        name: 'New Year\'s Eve Concert',
        organizer: 'Music Events Inc',
        artist: 'The Amazing Band',
        venue: 'Grand Stadium',
        details: 'Join us for an unforgettable New Year\'s Eve celebration with live music, amazing performances, and a spectacular countdown to midnight. This is a placeholder description for the concert event featuring top artists and entertainment.',
        price: 10,
        date: concertDate,
        image: 'placeholder-concert-image.jpg',
      });
      concerts.push(concert);
    }

    await this.concertRepository.save(concerts);
    this.logger.log('Successfully created concert with 10 tickets at $10 each');
  }
}
