import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Res,
  Req,
  NotFoundException,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ImagesService } from './images.service';
import { lookup } from 'mime-types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get(':imageName')
  async getImage(
    @Param('imageName') imageName: string,
    @Res() reply: FastifyReply,
  ) {
    const stream = await this.imagesService.get(imageName);

    const mimeType = lookup(imageName) || 'application/octet-stream';

    reply.type(mimeType);
    reply.send(stream);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, jpeg, png, gif)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or file type',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async uploadImage(@Req() req: FastifyRequest) {
    try {
      if (!req.isMultipart()) {
        throw new Error('Request must be multipart/form-data');
      }

      const parts = req.parts();
      let filename = '';

      for await (const part of parts) {
        if (part.type === 'file') {
          filename = await this.imagesService.save({
            file: part.file,
            filename: part.filename,
            mimetype: part.mimetype,
          });
          break;
        }
      }

      if (!filename) {
        throw new Error('No image file provided');
      }

      return {
        message: 'Image uploaded successfully',
        filename,
        url: `/images/${filename}`,
      };
    } catch (err: any) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':imageName')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async deleteImage(@Param('imageName') imageName: string) {
    try {
      await this.imagesService.delete(imageName);
      return {
        message: 'Image deleted successfully',
      };
    } catch (err: any) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
