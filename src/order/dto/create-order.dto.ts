import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;
}