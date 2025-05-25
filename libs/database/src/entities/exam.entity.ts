import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { _Preset } from './_preset.entity';

@ApiSchema({ description: '考试' })
@Entity({
  name: 'exam',
})
export class Exam extends _Preset {
  @ApiProperty({ description: '问题' })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  questions: string | undefined;

  @ApiProperty({ description: '用户解答' })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  answers: string | undefined;

  @ApiProperty({ description: '参考答案' })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  keys: string | undefined;

  @ApiProperty({ description: '考试分数' })
  @Column({
    type: 'int',
    default: 0,
  })
  score: number;
}
