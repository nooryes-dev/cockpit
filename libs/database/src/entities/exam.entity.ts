import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { _Preset } from './_preset.entity';
import { User } from './user.entity';
import { tryParse } from '@aiszlab/relax';
import { SPEARATOR } from 'src/exam/constants';

export enum ExamStatus {
  // 初始化
  Initialized = 'initialized',
  // 生成中
  Generating = 'generating',
  // 草稿
  Draft = 'draft',
  // 已提交
  Submitted = 'submitted',
  // 审核中
  Reviewing = 'reviewing',
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
    name: 'questions',
  })
  _questions: string | undefined;

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

  @ApiProperty({ description: '创建人id', type: Number })
  @Column({
    name: 'created_by_id',
  })
  createdById: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
  })
  createdBy: User;

  /**
   * 序列化的考试问题
   */
  get questions(): string[] {
    return tryParse(this._questions);
  }

  /**
   * 按约定间隔符拼接的问题文本
   */
  get questionsMessage() {
    return this.questions.join(SPEARATOR);
  }
}

// 利用二进制位运算实现状态权限控制
const EXAM_STATUS: Record<ExamStatus, number> = {
  [ExamStatus.Initialized]: 0b00000001,
  [ExamStatus.Generating]: 0b00000010,
  [ExamStatus.Draft]: 0b00000100,
  [ExamStatus.Submitted]: 0b00001000,
  [ExamStatus.Reviewing]: 0b00010000,
  [ExamStatus.Frozen]: 0b00100000,
};

// 可生成状态
export const isGenerable = (status: ExamStatus) => {
  return !!(0b1 & EXAM_STATUS[status]);
};

// 可提交状态
export const isSubmittable = (status: ExamStatus) => {
  return !!(0b100 & EXAM_STATUS[status]);
};

// 可审查状态
export const isReviewable = (status: ExamStatus) => {
  return !!(0b1000 & EXAM_STATUS[status]);
};
