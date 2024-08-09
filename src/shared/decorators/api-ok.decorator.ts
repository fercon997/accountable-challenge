import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { Response } from '../base.controller';

export const ApiOkResponse = <DTO extends Type<unknown>>(dto: DTO) =>
  applyDecorators(
    ApiExtraModels(Response, dto),
    ApiResponse({
      status: 200,
      schema: {
        allOf: [
          { $ref: getSchemaPath(Response) },
          {
            properties: {
              data: {
                $ref: getSchemaPath(dto),
              },
            },
          },
        ],
      },
    }),
  );
