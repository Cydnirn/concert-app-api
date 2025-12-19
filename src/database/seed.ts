import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seeder = app.get(SeederService);

  try {
    console.log('Starting database seeding...');
    await seeder.seed();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap();
