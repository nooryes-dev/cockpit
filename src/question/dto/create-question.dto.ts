import { Question } from '@/libs/database/entities/question.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class CreateQuestionDto extends PickType(Question, ['topic']) {
  @ApiProperty({
    description: '关联分类code',
  })
  categoryCode: string;
}
