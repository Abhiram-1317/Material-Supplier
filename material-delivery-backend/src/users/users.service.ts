import {Injectable, ForbiddenException} from '@nestjs/common';
import {UserRole} from '@prisma/client';
import {PrismaService} from '../prisma/prisma.service';
import {UpdateProfileDto} from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: {id},
      include: {
        customer: true,
        supplier: true,
        admin: true,
      },
    });
  }

  listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        role: true,
        email: true,
        phone: true,
        fullName: true,
        createdAt: true,
      },
      orderBy: {createdAt: 'desc'},
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, role: UserRole) {
    if (role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Only customers can update profile');
    }

    const userUpdate: Record<string, unknown> = {};
    if (dto.fullName !== undefined) userUpdate.fullName = dto.fullName;

    const customerUpdate: Record<string, unknown> = {};
    if (dto.companyName !== undefined) customerUpdate.companyName = dto.companyName;
    if (dto.gstNumber !== undefined) customerUpdate.gstNumber = dto.gstNumber;

    const data: any = {...userUpdate};
    if (Object.keys(customerUpdate).length > 0) {
      data.customer = {update: customerUpdate};
    }

    return this.prisma.user.update({
      where: {id: userId},
      data,
      include: {
        customer: true,
        supplier: true,
        admin: true,
      },
    });
  }
}
