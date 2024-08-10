import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { BookDto } from '@book/domain/dto';
import { PaginationResult } from './types';

export class Response<T> {
  @ApiProperty()
  @ValidateNested()
  data: T;

  @ApiProperty()
  statusCode: number;
}

export class ResponsePaginated<T> {
  data: T[];

  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  nextPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalCount: number;
}

export class BaseController {
  protected ok<T>(response?: T): Response<T> {
    return {
      statusCode: 200,
      data: response,
    };
  }

  protected okPaginated<T, Pag extends PaginationResult<T>>(
    response: Pag,
  ): ResponsePaginated<T> {
    let totalPages = response.totalCount / response.pageSize;
    if (!Number.isInteger(totalPages)) {
      totalPages = Math.floor(totalPages) + 1;
    }
    const nextPage = response.page >= totalPages ? null : response.page + 1;
    return {
      statusCode: 200,
      data: response.data,
      page: response.page,
      nextPage,
      totalPages,
      totalCount: response.totalCount,
    };
  }
}
