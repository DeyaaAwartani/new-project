import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserRole } from '../auth/enums/user-role.enum';

@Injectable()
export class AdminService {
  constructor(private usersService: UsersService) {}

  async createAdmin(createAdminDto: CreateAdminDto) {
    try {
      const admin = await this.usersService.create({
        ...createAdminDto,
      });

      await this.usersService.updateRole(admin.id, UserRole.ADMIN);

      const { password, ...result } = admin;
      return {
        message: 'Admin created successfully',
        admin: result,
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async getAllAdmins() {
    const admins = await this.usersService.findByRole(UserRole.ADMIN);
    return admins.map(({ password, ...rest }) => rest);
  }

  async getAdminById(id: number) {
    const admin = await this.usersService.findOne(id);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('User is not an admin');
    }
    const { password, ...result } = admin;
    return result;
  }

  async deleteAdmin(id: number) {
    const admin = await this.usersService.findOne(id);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('User is not an admin');
    }
    await this.usersService.remove(id);
    return { message: 'Admin deleted successfully' };
  }
}
