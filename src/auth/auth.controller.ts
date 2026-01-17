import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { CurrentUser } from './../decorators';
import type { CurrentUserType } from '../common/types/current-user.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return result;
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(@CurrentUser() user: CurrentUserType) {
    if (!user) {
      throw new UnauthorizedException('User not found in token');
    }
    return this.authService.refreshAccessToken(user);
  }
}
