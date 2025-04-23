import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: '按技术栈统计问题点数',
})
export class CountByTechStackCodeDto {
  @ApiProperty({
    description: '技术栈code',
    required: false,
    type: 'string',
  })
  techStackCode?: string;
}

@ApiSchema({
  name: '技术栈问题点统计数',
})
export class CountedByTechStackCodeDto {
  @ApiProperty({
    description: '统计数',
  })
  total: number;
}
