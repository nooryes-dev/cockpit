import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: '提交考试' })
export class SubmitExamDto {
  @ApiProperty({
    description: '答案',
    required: true,
    isArray: true,
    type: 'string',
  })
  answers: string[];
}
