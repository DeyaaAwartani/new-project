import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AddCreditsDto } from './dto/add-credits.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/auth/enums/user-role.enum';
import { Roles } from 'src/decorators';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':userId/add-credits')
  adminAddCredits(@Param('userId') userId: string, @Body() dto: AddCreditsDto) {
    return this.walletService.adminAddCredits(Number(userId), dto.amount);
  }
}
