import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { CurrentUserId } from '../decorators/current-user-id.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.SYSTEM)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Get('list')
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get(':id')
  async getAdminById(@Param('id') id: string) {
    return this.adminService.getAdminById(Number(id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteAdmin(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: number,
  ) {
    const adminIdToDelete = Number(id);
    
    // Prevent admin from deleting themselves
    if (adminIdToDelete === currentUserId) {
      throw new Error('Cannot delete your own admin account');
    }

    return this.adminService.deleteAdmin(adminIdToDelete);
  }
}
