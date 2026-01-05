import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import twilio, { Twilio } from 'twilio';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto, VerifyOtpDto } from './dto/customer-otp.dto';

const DEMO_OTP = '123456';

@Injectable()
export class AuthService {
  private twilioClient: Twilio | null = null;
  private twilioVerifyServiceSid: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    const accountSid = this.config.get<string>('twilioVerify.accountSid');
    const authToken = this.config.get<string>('twilioVerify.authToken');
    const serviceSid = this.config.get<string>('twilioVerify.serviceSid');

    if (accountSid && authToken && serviceSid) {
      this.twilioClient = twilio(accountSid, authToken);
      this.twilioVerifyServiceSid = serviceSid;
    } else {
      this.twilioClient = null;
      this.twilioVerifyServiceSid = null;
    }
  }

  private buildJwtPayload(user: {
    id: string;
    role: UserRole;
    email?: string | null;
    phone?: string | null;
  }) {
    return {
      sub: user.id,
      role: user.role,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
    };
  }

  async validateUserByEmail(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: { in: [UserRole.SUPPLIER, UserRole.ADMIN] },
      },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUserByEmail(dto.email, dto.password);
    const payload = this.buildJwtPayload(user);
    const accessToken = await this.jwtService.signAsync(payload);
    return {accessToken, user};
  }

  async requestCustomerOtp(dto: RequestOtpDto) {
    const { phone } = dto;

    if (!this.twilioClient || !this.twilioVerifyServiceSid) {
      return {
        success: true,
        message: 'OTP service not configured; using demo OTP 123456.',
        demoOtp: DEMO_OTP,
      };
    }

    await this.twilioClient.verify.v2
      .services(this.twilioVerifyServiceSid)
      .verifications.create({
        to: phone,
        channel: 'sms',
      });

    return { success: true, message: 'OTP sent via SMS' };
  }

  async verifyCustomerOtp(dto: VerifyOtpDto) {
    const { phone, otp } = dto;

    if (!this.twilioClient || !this.twilioVerifyServiceSid) {
      if (otp !== DEMO_OTP) {
        throw new UnauthorizedException('Invalid OTP (demo mode).');
      }
      let user = await this.prisma.user.findUnique({ where: { phone } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            phone,
            role: UserRole.CUSTOMER,
            customer: { create: {} },
          },
        });
      }
      const payload = this.buildJwtPayload(user);
      const accessToken = await this.jwtService.signAsync(payload);
      return { accessToken, user };
    }

    const check = await this.twilioClient.verify.v2
      .services(this.twilioVerifyServiceSid)
      .verificationChecks.create({
        to: phone,
        code: otp,
      });

    if (check.status !== 'approved') {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          role: UserRole.CUSTOMER,
          customer: { create: {} },
        },
      });
    }

    const payload = this.buildJwtPayload(user);
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken, user };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: true,
        supplier: true,
        admin: true,
      },
    });
  }
}
