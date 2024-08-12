import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ReservationDto } from './reservation.dto';

export class WalletDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNumber()
  balance: number;

  @ApiProperty({ type: ReservationDto, isArray: true })
  @IsArray({ each: true })
  @MinLength(0)
  reservations: ReservationDto[];
}

export class UpdateBalanceDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  amount: number;
}
