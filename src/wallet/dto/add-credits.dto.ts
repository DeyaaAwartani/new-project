import { IsNumber, IsPositive } from 'class-validator';

export class AddCreditsDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
