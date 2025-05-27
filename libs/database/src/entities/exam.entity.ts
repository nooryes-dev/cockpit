import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { _Preset } from './_preset.entity';

export enum ExamStatus {
  // 初始化
  Initialized = 'initialized',
  // 草稿
  Draft = 'draft',
  // 已提交
  Submitted = 'submitted',
  // 冻结
  Frozen = 'frozen',
}

@ApiSchema({ description: '考试' })
@Entity({
  name: 'exam',
})
export class Exam extends _Preset {
  @ApiProperty({ description: '职位' })
  @Column({
    type: 'varchar',
    length: 20,
  })
  position: string;

  @ApiProperty({ description: '问题' })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  questions: string | undefined;

  @ApiProperty({ description: '用户解答' })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  answers: string | undefined;

  @ApiProperty({ description: '评论' })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  comments: string | undefined;

  @ApiProperty({ description: '考试分数' })
  @Column({
    type: 'int',
    default: 0,
  })
  score: number;

  @ApiProperty({ description: '考试状态' })
  @Column({
    type: 'enum',
    enum: ExamStatus,
    default: ExamStatus.Initialized,
  })
  status: ExamStatus;
}

// 利用二进制位运算实现状态权限控制
const EXAM_STATUS: Record<ExamStatus, number> = {
  [ExamStatus.Initialized]: 0b00000001,
  [ExamStatus.Draft]: 0b00000010,
  [ExamStatus.Submitted]: 0b00000100,
  [ExamStatus.Frozen]: 0b00001000,
};

// 可生成状态
export const isQuestionsGenerable = (status: ExamStatus) => {
  return !!(0b1 & EXAM_STATUS[status]);
};

// 可提交状态
export const isSubmittable = (status: ExamStatus) => {
  return !!(0b10 & EXAM_STATUS[status]);
};

// 可审查状态
export const isReviewable = (status: ExamStatus) => {
  return !!(0b100 & EXAM_STATUS[status]);
};
