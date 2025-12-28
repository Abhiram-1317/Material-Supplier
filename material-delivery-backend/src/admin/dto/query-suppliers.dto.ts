import {IsEnum, IsInt, IsOptional, IsPositive, IsString} from 'class-validator';
import {Type} from 'class-transformer';
import {SupplierStatus} from '@prisma/client';

export class QuerySuppliersDto {
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @IsOptional()
  @IsString()
  cityCode?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pageSize?: number;
}
