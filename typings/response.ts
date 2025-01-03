import { ApiProperty } from '@nestjs/swagger';

export enum StatusCode {
  Success = '200',
  Fail = '500',
}

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
  statusCode: StatusCode.Fail;

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

/**
 * @description 分页响应格式
 */
export class Paginated<T> {
  @ApiProperty({
    description: '总数',
    type: Number,
    default: 10,
  })
  total: number;

  @ApiProperty({
    description: '当前页',
    type: Number,
    default: 1,
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    type: Number,
    default: 10,
  })
  pageSize: number;

  @ApiProperty({
    description: '列表数据',
  })
  items: T[];
}
