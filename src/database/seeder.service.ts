import fs from 'fs';
import path from 'path';
import https from 'https';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Concert } from '../concert/concert.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Concert)
    private concertRepository: Repository<Concert>,

    private configService: ConfigService,
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

    // Create concerts
    const concerts = [];
    const concertDate = new Date('2024-12-31T20:00:00Z');
    // Download and save concert image
    const imageUrl =
      'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/19c68c00-9f04-4a56-9f8c-f3a5eeb03c27.jpg';
    const imageName = 'kessoku-concert.jpg';
    const uploadDir =
      this.configService.get<string>('FILE_DIRECTORY') || './uploads';

    try {
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const imagePath = path.join(uploadDir, imageName);

      // Download image
      await new Promise((resolve, reject) => {
        https
          .get(imageUrl, (response: any) => {
            const fileStream = fs.createWriteStream(imagePath);
            response.pipe(fileStream);
            fileStream.on('finish', () => {
              fileStream.close();
              this.logger.log(`Image downloaded successfully: ${imageName}`);
              resolve(true);
            });
            fileStream.on('error', reject);
          })
          .on('error', reject);
      });
    } catch (error) {
      this.logger.error('Failed to download image:', error);
    }

    const concert = this.concertRepository.create({
      name: 'Kessoku Debut Concert',
      organizer: 'Starry Inc',
      artist: 'Kessoku Band',
      venue: 'Buddokan Stadium',
      details:
        'Join us for an unforgettable Kessoku Debut Concert with live music, amazing performances, and a spectacular countdown to midnight. This is a placeholder description for the concert event featuring top artists and entertainment.',
      price: 10,
      date: concertDate,
      image: 'kessoku-concert.jpg',
    });
    concerts.push(concert);

    await this.concertRepository.save(concerts);
    this.logger.log('Successfully created concert with 10 tickets at $10 each');
  }
}
