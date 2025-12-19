import {
  Body,
  Controller,
  Post,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiProperty, ApiResponse } from '@nestjs/swagger';

class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ example: 'admin123' })
  password: string;
}

class RefreshDto {
  @ApiProperty()
  sessionToken: string;
}

class LogoutDto {
  @ApiProperty()
  sessionToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto.email, loginDto.password);
    } catch (err: any) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: err.message,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired session token',
  })
  async refresh(@Body() refreshDto: RefreshDto) {
    try {
      return await this.authService.refresh(refreshDto.sessionToken);
    } catch (err: any) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: err.message,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  async logout(@Body() logoutDto: LogoutDto) {
    try {
      return await this.authService.logout(logoutDto.sessionToken);
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
