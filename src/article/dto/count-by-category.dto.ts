import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: '按分类统计知识点数',
})
export class CountByCategoryDto {
  @ApiProperty({
    description: '技术栈code',
    required: false,
    type: 'string',
  })
  techStackCode?: string;
}

@ApiSchema({
  name: '知识点统计数',
})
export class CountedByCategoryDto {
  @ApiProperty({
    description: '分类code',
  })
  categoryCode: string;

  @ApiProperty({
    description: '分类名称',
  })
  categoryName: string;

  @ApiProperty({
    description: '统计数',
  })
  total: number;
}
