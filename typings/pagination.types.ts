import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

@ApiSchema({ description: '分页请求格式' })
export class Pagination {
  @ApiProperty({
    description: '当前页',
    type: Number,
    default: 1,
  })
  @IsNumber(void 0, { message: '请输入页码' })
  @Min(1)
  page: number;

  @ApiProperty({
    description: '每页数量',
    type: Number,
    default: 10,
  })
  @IsNumber(void 0, { message: '请输入每页数量' })
  @Min(1)
  pageSize: number;
}

@ApiSchema({ description: '分页响应格式' })
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
