import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { CurrentUserType } from '../common/types/current-user.type';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly systemSecret = process.env.SYSTEM_SECRET;

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get request
    const request = context.switchToHttp().getRequest();
    let user: CurrentUserType | null = request.user;

    // Check if system role is required
    if (requiredRoles.includes(UserRole.SYSTEM)) {
      const systemToken = request.headers['x-system-secret'];
      
      if (systemToken === this.systemSecret) {
        // Attach system user to request
        request.user = {
          userId: 0,
          role: UserRole.SYSTEM,
          email: 'system@internal',
          authenticatedAt: new Date().toISOString(),
          tokenType: 'system',
        };
        return true;
      }
    }

    // Fallback: If user doesn't exist, try to verify from authorization header
    if (!user) {
      user = await this.verifyTokenFromHeader(request);
      if (user) {
        request.user = user;
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user has required role
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }

  private async verifyTokenFromHeader(request: any): Promise<CurrentUserType | null> {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization scheme');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      const user: CurrentUserType = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        authenticatedAt: new Date().toISOString(),
        tokenType: 'access',
      };

      return user;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }

      return null;
    }
  }
}
