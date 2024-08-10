import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { Genres } from '@shared/types';

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
