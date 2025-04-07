import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Pagination } from 'typings/pagination.types';

@ApiSchema({ description: '搜索问题点列表参数' })
export class SearchQuestionsDto extends Pagination {
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

  @ApiProperty({
    description: '返回数据中是否包含content字段',
    required: false,
    type: 'string',
  })
  hasContent?: 'y' | 'n';

  @ApiProperty({
    description: '排序',
    required: false,
    type: 'string',
  })
  sequence?: 'ASC' | 'DESC';
}

@ApiSchema({ description: '搜索展示的问题点实体' })
export class SearchedQuestionDto {
  @ApiProperty({
    description: '问题点id',
  })
  id: string;

  @ApiProperty({
    description: '题目',
  })
  topic: string;

  @ApiProperty({
    description: '答案',
  })
  answer?: string;

  @ApiProperty({
    description: '分类code',
  })
  categoryCode: string;

  @ApiProperty({
    description: '分类名称',
  })
  categoryName: string;

  @ApiProperty({
    description: '技术栈code',
  })
  techStackCode: string;
}
