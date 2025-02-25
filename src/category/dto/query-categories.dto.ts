import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Pagination } from 'typings/pagination.types';

@ApiSchema({ description: '查询分类列表参数' })
export class QueryCategoriesDto extends Pagination {
  @ApiProperty({
    description: '技术栈codes',
    required: false,
    isArray: true,
    type: 'string',
  })
  techStackCodes?: string[];

  @ApiProperty({
    description: '分类code',
    required: false,
    type: 'string',
  })
  code?: string;

  @ApiProperty({
    description: '分类name',
    required: false,
    type: 'string',
  })
  name?: string;
}
