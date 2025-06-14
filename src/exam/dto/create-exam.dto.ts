import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@ApiSchema({ description: '创建考试' })
export class CreateExamDto {
  @ApiProperty({
    description: '职位名称',
    type: String,
    required: true,
  })
  @IsNotEmpty({
    message: '请输入职位名称',
  })
  position: string;
}
