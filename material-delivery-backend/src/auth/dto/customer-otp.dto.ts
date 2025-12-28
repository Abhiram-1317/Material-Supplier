import {IsNotEmpty, IsPhoneNumber, Length} from 'class-validator';

export class RequestOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber('IN')
  phone!: string;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsPhoneNumber('IN')
  phone!: string;

  @IsNotEmpty()
  @Length(6, 6)
  otp!: string;
}
