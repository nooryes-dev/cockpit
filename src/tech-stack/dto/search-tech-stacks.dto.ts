import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: '搜索技术栈列表参数' })
export class SearchTechStacksDto {
  @ApiProperty({
    description: '关键字',
    required: false,
    type: 'string',
  })
  keyword?: string;
}

@ApiSchema({ description: '技术栈搜索结果' })
export class SearchedTechStackDto {
  @ApiProperty({
    description: '技术栈code',
    type: 'string',
  })
  code: string;

  @ApiProperty({
    description: '技术栈name',
    type: 'string',
  })
  name: string;
}
