import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/users.entity';
import { CurrentUserType } from '../common/types/current-user.type';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserLoggedInEvent } from 'src/common/events/user-logged-in.event';
import { WalletService } from 'src/wallet/wallet.service';
import { RealtimeGateway } from 'src/real-time/realtime.gateway';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    // Sign access token with access secret
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '15m',
    });

    // Sign refresh token with refresh secret
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      const { password, ...result } = user;
      const { accessToken, refreshToken } = this.generateTokens(user);
      return {
        message: 'User registered successfully',
        accessToken,
        refreshToken,
        user: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await this.usersService.validatePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        return null;
      }

      if (isPasswordValid) {
        const { password, ...result } = user;
        const { accessToken, refreshToken } = this.generateTokens(user);
        this.eventEmitter.emit(
          'user.logged_in',
          new UserLoggedInEvent(user.id, user.role),
        );
        this.realtimeGateway.emitUserOnline({
          userId: user.id,
          email: user.email,
        });
        return {
          user: result,
          accessToken,
          refreshToken,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async refreshAccessToken(user: CurrentUserType) {
    const userData = await this.usersService.findOne(user.userId);
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = userData;
    const { accessToken, refreshToken } = this.generateTokens(userData);
    return {
      accessToken,
      refreshToken,
      user: result,
    };
  }
}
