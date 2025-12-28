import {DiscountType} from '@prisma/client';
import {Type} from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  value!: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minOrderValue!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxDiscountAmount?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsDateString()
  expiryDate!: string;
}
