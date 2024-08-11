import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Genres } from '@shared/types';
import { PaginationDto } from '@shared/dto';

export class BookDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiProperty()
  @IsNumber()
  publicationYear: number;

  @ApiProperty()
  @IsString()
  publisher: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsEnum(Genres)
  genre: Genres;
}

export class ResponseBookDto extends BookDto {
  @ApiProperty()
  @IsBoolean()
  isAvailable: boolean;
}

export class CreateBookDto extends BookDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

export class PaginationBookDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsEnum(Genres)
  @IsOptional()
  genre?: Genres;
}
