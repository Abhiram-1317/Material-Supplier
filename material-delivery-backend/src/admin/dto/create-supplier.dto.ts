import {IsEmail, IsInt, IsOptional, IsString, MinLength} from 'class-validator';
import {Type} from 'class-transformer';

export class CreateSupplierDto {
  @IsString()
  companyName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phone: string;

  @Type(() => Number)
  @IsInt()
  cityId: number;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;
}
