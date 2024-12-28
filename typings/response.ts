import { ApiProperty } from '@nestjs/swagger';

export enum StatusCode {
  Success = '200',
  Fail = '500',
}

export class SucceedResponse<T> {
  @ApiProperty({
    description: '成功响应：200',
  })
  statusCode: StatusCode.Success;

  @ApiProperty({
    description: '响应内容',
  })
  data: T;
}

export class FailedResponse {
  @ApiProperty({
    description: '失败响应：500',
  })
  statusCode: StatusCode.Fail;

  @ApiProperty({
    description: '响应信息',
  })
  message: string;
}

/**
 * @description 全局统一的响应格式
 */
export type UnifiedResponse = SucceedResponse<unknown> | FailedResponse;
