import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  page: number;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  pageSize: number;
}
