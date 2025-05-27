import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: '提交考试' })
export class UpdateExamDto {
  @ApiProperty({
    description: '答案',
    type: String,
    required: true,
  })
  answers: string;
}
