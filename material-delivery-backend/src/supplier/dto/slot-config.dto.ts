import {Type} from 'class-transformer';
import {IsArray, IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, ValidateNested} from 'class-validator';

export class SlotConfigItemDto {
  @IsString()
  @IsNotEmpty()
  label: string; // e.g. "8–11 AM"

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxOrdersPerDay: number;

  @IsBoolean()
  isActive: boolean;
}

export class UpsertSlotConfigsDto {
  @IsArray()
  @ValidateNested({each: true})
  @Type(() => SlotConfigItemDto)
  slots: SlotConfigItemDto[];
}
