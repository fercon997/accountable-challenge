import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';

export class Response<T> {
  @ApiProperty()
  @ValidateNested()
  data: T;

  @ApiProperty()
  statusCode: number;
}

export class BaseController {
  protected ok<T>(response?: T): Response<T> {
    return {
      statusCode: 200,
      data: response,
    };
  }
}
