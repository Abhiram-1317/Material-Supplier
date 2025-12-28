import {IsDateString, IsNotEmpty, IsString} from 'class-validator';

export class SlotAvailabilityQueryDto {
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsDateString()
  date: string; // ISO date string "YYYY-MM-DD"
}
