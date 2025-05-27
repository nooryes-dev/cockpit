import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: '创建考试' })
export class CreateExamDto {
  @ApiProperty({
    description: '职位名称',
    type: String,
  })
  position: string;
}
