import {Type} from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
} from 'class-validator';

export class OrderItemInputDto {
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  siteId!: string;

  @IsNotEmpty()
  @IsString()
  supplierId!: string;

  @IsNotEmpty()
  @IsString()
  scheduledSlot!: string;

  @IsArray()
  @ArrayMinSize(1)
  items!: OrderItemInputDto[];

  @IsOptional()
  @IsString()
  couponCode?: string;
}
