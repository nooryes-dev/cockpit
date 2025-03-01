import { Article } from '@/libs/database/entities/article.entity';
import { ApiProperty, ApiSchema, PickType } from '@nestjs/swagger';
import { Pagination } from 'typings/pagination.types';

@ApiSchema({
  name: '分页查询文章列表',
})
export class QueryArticlesDto extends Pagination {
  @ApiProperty({
    description: '分类codes',
    required: false,
    isArray: true,
    type: 'string',
  })
  categoryCodes?: string[];

  @ApiProperty({
    description: '文章关键字',
    required: false,
    type: 'string',
  })
  keyword?: string;
}
