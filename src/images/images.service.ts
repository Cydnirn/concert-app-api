import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, createWriteStream } from 'fs';
import { stat, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import * as path from 'path';

const pump = promisify(pipeline);

@Injectable()
export class ImagesService {
  constructor(private configService: ConfigService) {}

  async get(imageName: string) {
    const uploadsPath =
      this.configService.get<string>('FILE_DIRECTORY') || './uploads';
    const imagePath = join(uploadsPath, imageName);

    try {
      await stat(imagePath);
    } catch (error) {
      throw new NotFoundException('Image not found');
    }

    return createReadStream(imagePath);
  }

  async save(image: {
    file: NodeJS.ReadableStream;
    filename: string;
    mimetype: string;
  }): Promise<string> {
    // Validate that it's actually an image
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
    ];

    if (!allowedMimeTypes.includes(image.mimetype)) {
      throw new Error('File is not an image');
    }

    const filePath =
      this.configService.get<string>('FILE_DIRECTORY') ?? 'uploads';
    const ext = path.extname(image.filename);
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const filename = `${randomName}${ext}`;

    try {
      const uploadPath = path.join(filePath, filename);

      // Ensure uploads directory exists
      try {
        await stat(filePath);
      } catch {
        await mkdir(filePath, { recursive: true });
      }

      // Save file
      await pump(image.file, createWriteStream(uploadPath));

      return filename;
    } catch (error) {
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  async delete(imageName: string): Promise<void> {
    const uploadsPath =
      this.configService.get<string>('FILE_DIRECTORY') || './uploads';
    const imagePath = join(uploadsPath, imageName);

    try {
      await stat(imagePath);
    } catch (error) {
      throw new NotFoundException('Image not found');
    }

    try {
      await unlink(imagePath);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
}
