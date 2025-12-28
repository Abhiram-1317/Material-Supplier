import {IsEnum, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString} from 'class-validator';
import {DriverStatus} from '@prisma/client';

export class CreateDriverDto {
  @IsString()
  name: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsNumber()
  @IsPositive()
  cityId: number;

  @IsString()
  licenseNumber: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  assignedVehicleId?: string;
}

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  cityId?: number;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  assignedVehicleId?: string | null;
}
