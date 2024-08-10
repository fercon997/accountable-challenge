import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponsePaginated } from '../base.controller';

export const ApiOkResponsePaginated = <DTO extends Type<unknown>>(dto: DTO) =>
  applyDecorators(
    ApiExtraModels(ResponsePaginated, dto),
    ApiResponse({
      status: 200,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponsePaginated) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dto) },
              },
            },
          },
        ],
      },
    }),
  );
