import { ApiProperty } from '@nestjs/swagger';

export enum StatusCode {
  Success = '200',
  Unauthorized = '401',
  Fail = '500',
}

export type UnsuccessStatusCode = Exclude<StatusCode, StatusCode.Success>;

export class SucceedResponse<T> {
  @ApiProperty({
    description: '成功响应：200',
    default: '200',
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
    default: '500',
  })
  statusCode: UnsuccessStatusCode;

  @ApiProperty({
    description: '响应信息',
    default: '系统繁忙，请稍后再试！',
  })
  message: string;
}

/**
 * @description 全局统一的响应格式
 */
export type UnifiedResponse = SucceedResponse<unknown> | FailedResponse;
