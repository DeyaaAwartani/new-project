import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  toEmail: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsObject()
  templateData: Record<string, any>;
}
