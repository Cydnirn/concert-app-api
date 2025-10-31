import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConcertModule } from './concert/concert.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from './images/images.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    ConcertModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const sslCaPath = configService.get<string>('DATABASE_SSL_CA');
        console.log('SSL CA Path:', sslCaPath);
        const sslConfig = sslCaPath
          ? {
              rejectUnauthorized: false,
              ca: fs.readFileSync(path.resolve(sslCaPath), 'utf8'),
            }
          : { rejectUnauthorized: false };

        if (configService.get<string>('NODE_ENV') === 'development') {
          return {
            type: 'postgres',
            url: configService.get<string>('DATABASE_URL'),
            autoLoadEntities: true,
            synchronize: true,
          };
        }

        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: true,
          extra: {
            ssl: sslConfig,
          },
        };
      },
    }),
    ImagesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
