import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { _Preset } from './_preset.entity';
import { User } from './user.entity';
import { tryParse } from '@aiszlab/relax';
import { SPEARATOR } from 'src/exam/constants';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

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

  @ApiProperty({ description: '问题列表', type: 'string', nullable: true })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  questions: string | undefined;

  @ApiProperty({ description: '用户解答', type: 'string', nullable: true })
  @Column({
    type: 'longtext',
    nullable: true,
  })
  answers: string | undefined;

  @ApiProperty({ description: '评论', type: 'string', nullable: true })
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

  @ApiProperty({ description: '考试状态', enum: ExamStatus })
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
  get questionList(): string[] {
    return tryParse(this.questions);
  }

  /**
   * 按约定间隔符拼接的问题文本
   */
  get questionsChunk() {
    return this.questionList.join(SPEARATOR);
  }

  /**
   * @description 序列化的答案
   */
  get answerList() {
    return tryParse(this.answers);
  }

  /**
   * 打分和评论的合并消息
   */
  get scoreAndComments() {
    return `${this.score}${SPEARATOR}${this.comments}`;
  }

  /**
   * review 完成的更新对象
   */
  public static reviewed(
    scoreAndComments: string | null,
  ): QueryDeepPartialEntity<Exam> {
    const [score, ...comments] = (scoreAndComments ?? '').split(SPEARATOR);

    return {
      score: Number(score) || 0,
      comments: comments.join(''),
      status: ExamStatus.Frozen,
    };
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
