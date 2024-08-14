import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReservationStatus } from '../../common/entities';

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  bookId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsDateString()
  expectedReturnDate: Date;
}

export class ReservationDto extends CreateReservationDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  reservationDate: Date;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  returnDate?: Date;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  lateFees?: number;

  @ApiProperty()
  @IsEnum(ReservationStatus)
  @IsOptional()
  status: ReservationStatus;
}
