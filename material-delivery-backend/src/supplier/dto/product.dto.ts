import {IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsPositive, IsString, Min} from 'class-validator';
import {Unit} from '@prisma/client';

export class CreateSupplierProductDto {
  @IsString()
  name: string;

  @IsString()
  categorySlug: string;

  @IsEnum(Unit)
  unit: Unit;

  @IsNumber()
  @IsPositive()
  basePrice: number;

  @IsNumber()
  @IsPositive()
  minOrderQty: number;

  @IsNumber()
  @Min(0)
  leadTimeHours: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsArray()
  bulkTiers?: Array<Record<string, any>>;

  @IsOptional()
  @IsNumber()
  deliveryCharge?: number;
}

export class UpdateSupplierProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsEnum(Unit)
  unit?: Unit;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minOrderQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeHours?: number;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsArray()
  bulkTiers?: Array<Record<string, any>>;

  @IsOptional()
  @IsNumber()
  deliveryCharge?: number;
}
