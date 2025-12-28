import {IsEnum, IsNumber, IsOptional, IsPositive, IsString} from 'class-validator';
import {VehicleStatus, VehicleType} from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  registrationNumber: string;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsNumber()
  @IsPositive()
  capacityTons: number;

  @IsNumber()
  @IsPositive()
  cityId: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  capacityTons?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  cityId?: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  assignedDriverId?: string | null;
}
