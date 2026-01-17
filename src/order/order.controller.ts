import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUserId, Roles } from 'src/decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserRole } from 'src/auth/enums/user-role.enum';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@CurrentUserId() userId: number, @Body() dto:CreateOrderDto){
    return this.orderService.creatPendingOrder(userId,dto.productId)
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminGetAllOrders(@Query('page') page = '1',@Query('limit') limit = '10',) {
    return this.orderService.adminFindPendingPaginated(Number(page), Number(limit));
  }

  @Post(':orderId/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  adminApprove(@Param('orderId') orderId: string) {
    return this.orderService.adminApproveOrder(Number(orderId));
  }

  @Post(':orderId/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  adminReject(@Param('orderId') orderId: string) {
    return this.orderService.adminRejectOrder(Number(orderId));
  }
}
