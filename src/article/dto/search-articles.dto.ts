import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Pagination } from 'typings/pagination.types';

@ApiSchema({ description: '搜索知识点列表参数' })
export class SearchArticlesDto extends Pagination {
  @ApiProperty({
    description: '二级分类code',
    required: false,
    type: 'string',
  })
  categoryCode?: string;

  @ApiProperty({
    description: '知识标题关键字',
    required: false,
    type: 'string',
  })
  keyword?: string;
}

@ApiSchema({ description: '搜索展示的知识点实体' })
export class SearchedArticleDto {
  @ApiProperty({
    description: '知识点id',
  })
  id: string;

  @ApiProperty({
    description: '知识点标题',
  })
  title: string;

  @ApiProperty({
    description: '知识点内容',
  })
  content: string;
}
