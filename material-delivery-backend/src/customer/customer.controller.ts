import {Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {Roles} from '../auth/roles.decorator';
import {RolesGuard} from '../auth/roles.guard';
import {CreateSiteDto, UpdateSiteDto} from './dto/site.dto';
import {UpdateCustomerProfileDto} from './dto/update-customer-profile.dto';
import {CustomerService} from './customer.service';

@ApiTags('customer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.customerService.getProfile(req.user.sub);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateCustomerProfileDto) {
    return this.customerService.updateProfile(req.user.sub, dto);
  }

  @Get('sites')
  listSites(@Request() req: any) {
    return this.customerService.listSites(req.user.sub);
  }

  @Post('sites')
  createSite(@Request() req: any, @Body() dto: CreateSiteDto) {
    return this.customerService.createSite(req.user.sub, dto);
  }

  @Patch('sites/:id')
  updateSite(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateSiteDto) {
    return this.customerService.updateSite(req.user.sub, id, dto);
  }

  @Delete('sites/:id')
  deleteSite(@Request() req: any, @Param('id') id: string) {
    return this.customerService.deleteSite(req.user.sub, id);
  }
}
