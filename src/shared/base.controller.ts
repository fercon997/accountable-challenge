import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { PaginationResult } from './types';

export class BaseResponse {
  @ApiProperty()
  statusCode: number;
}

export class Response<T> extends BaseResponse {
  @ApiProperty()
  @ValidateNested()
  data: T;
}

export class ResponsePaginated<T> extends BaseResponse {
  data: T[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  nextPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalCount: number;
}

export abstract class BaseController {
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
