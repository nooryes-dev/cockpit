import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Pagination } from 'typings/pagination.types';

@ApiSchema({
  name: '分页查询问题列表',
})
export class QueryQuestionsDto extends Pagination {
  @ApiProperty({
    description: '分类code',
    required: false,
    type: 'string',
  })
  categoryCode?: string;
}
