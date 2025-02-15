import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Pagination } from 'typings/pagination.types';

@ApiSchema({ description: '查询技术栈列表参数' })
export class QueryTechStacksDto extends Pagination {
  @ApiProperty({
    description: '技术栈code',
    required: false,
    type: 'string',
  })
  code?: string;

  @ApiProperty({
    description: '技术栈name',
    required: false,
    type: 'string',
  })
  name?: string;
}
