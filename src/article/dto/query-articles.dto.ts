import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Pagination } from 'typings/pagination.types';

@ApiSchema({
  name: '分页查询知识点列表',
})
export class QueryArticlesDto extends Pagination {
  @ApiProperty({
    description: '分类code',
    required: false,
    type: 'string',
  })
  categoryCode?: string;

  @ApiProperty({
    description: '知识点关键字',
    required: false,
    type: 'string',
  })
  keyword?: string;
}
