import {Body, Controller, Get, Patch, Request, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {UserRole} from '@prisma/client';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {Roles} from '../auth/roles.decorator';
import {RolesGuard} from '../auth/roles.guard';
import {UpdateProfileDto} from './dto/update-profile.dto';
import {UsersService} from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Request() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async listUsers() {
    return this.usersService.listUsers();
  }

  @Patch('me')
  @Roles(UserRole.CUSTOMER)
  async updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto, req.user.role as UserRole);
  }
}
