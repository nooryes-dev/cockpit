import { Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { FailedResponse, SucceedResponse } from 'typings/response';

export const ApiUnifiedResponse = (
  ref: SchemaObject | ReferenceObject | Type,
) =>
  ApiResponse({
    schema: {
      oneOf: [
        {
          allOf: [
            { $ref: getSchemaPath(SucceedResponse) },
            {
              properties: {
                data:
                  typeof ref === 'function'
                    ? { $ref: getSchemaPath(ref) }
                    : ref,
              },
            },
          ],
          title: '成功响应',
        },
        {
          allOf: [{ $ref: getSchemaPath(FailedResponse) }],
          title: '失败响应',
        },
      ],
    },
  });
