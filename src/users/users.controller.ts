import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from 'src/dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createUser(@Body() userDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(userDto);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() userDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, userDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
