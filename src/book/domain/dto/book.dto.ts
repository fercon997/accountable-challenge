import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Genres } from '@shared/types';
import { PaginationDto } from '@shared/dto';
import { fa } from '@faker-js/faker';

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
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty()
  @IsEnum(Genres)
  genre: Genres;
}

export class UpdateBookDto extends PartialType(BookDto) {}

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
