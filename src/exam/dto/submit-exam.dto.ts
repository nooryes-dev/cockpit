import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

@ApiSchema({ description: '提交考试' })
export class SubmitExamDto {
  @ApiProperty({
    description: '答案',
    required: true,
    isArray: true,
    type: 'string',
  })
  @IsArray()
  @ArrayMinSize(10)
  @ArrayMaxSize(10)
  @IsNotEmpty({ each: true })
  answers: string[];
}
