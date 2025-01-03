import { Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { FailedResponse, Paginated, SucceedResponse } from 'typings/response';

export const ApiUnifiedPaginatedResponse = (
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
                data: {
                  allOf: [
                    { $ref: getSchemaPath(Paginated) },
                    {
                      properties: {
                        items: {
                          type: 'array',
                          items:
                            typeof ref === 'function'
                              ? { $ref: getSchemaPath(ref) }
                              : ref,
                        },
                      },
                    },
                  ],
                },
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
