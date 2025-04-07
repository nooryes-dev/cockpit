import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: '搜索分类列表参数' })
export class SearchCategoriesDto {
  @ApiProperty({
    description: '关键字',
    required: false,
    type: 'string',
  })
  keyword?: string;

  @ApiProperty({
    description: '技术栈（一级分类）code',
    required: false,
    type: 'string',
  })
  techStackCode?: string;
}

@ApiSchema({ description: '分类搜索结果' })
export class SearchedCategoryDto {
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

  @ApiProperty({
    description: '技术栈name',
    type: 'string',
  })
  techStackName: string;

  @ApiProperty({
    description: '技术栈code',
    type: 'string',
  })
  techStackCode: string;
}
