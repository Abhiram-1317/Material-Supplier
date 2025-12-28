import {Body, Controller, Get, Post, Request, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {JwtAuthGuard} from './jwt-auth.guard';
import {LoginDto} from './dto/login.dto';
import {RequestOtpDto, VerifyOtpDto} from './dto/customer-otp.dto';
import {Throttle} from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({default: {limit: 10, ttl: 60_000}})
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('customer/otp/request')
  @Throttle({default: {limit: 5, ttl: 60_000}})
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestCustomerOtp(dto);
  }

  @Post('customer/otp/verify')
  @Throttle({default: {limit: 10, ttl: 60_000}})
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyCustomerOtp(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    return this.authService.me(req.user.sub);
  }
}
