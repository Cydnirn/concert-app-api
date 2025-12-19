import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../users/user.entity';
import { Concert } from '../concert/concert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Concert])],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}
