import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: '搜索分类列表参数' })
export class SearchCategoriesDto {
  @ApiProperty({
    description: '关键字',
    required: false,
    type: 'string',
  })
  keyword?: string;
}

@ApiSchema({ description: '分类搜索结果' })
export class SearchedCategoriesDto {
  @ApiProperty({
    description: '分类code',
    type: 'string',
  })
  code: string;

  @ApiProperty({
    description: '分类name',
    type: 'string',
  })
  name: string;
}
