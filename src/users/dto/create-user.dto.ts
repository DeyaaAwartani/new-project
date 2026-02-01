import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^07\d{8}$/, {
    message:
      'phoneNumber must be Jordanian local format: 07XXXXXXXX (10 digits)',
  })
  phoneNumber?: string;
}
