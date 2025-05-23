import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { _PresetDate } from './_preset.entity';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from './user.entity';
import { Category } from './category.entity';

export enum QuestionStatus {
  Withdrawn = 'withdrawn',
  Published = 'published',
}

@ApiSchema({ description: '问题点' })
@Entity({
  name: 'question',
})
export class Question extends _PresetDate {
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '题目' })
  @Column({
    type: 'longtext',
  })
  topic: string;

  @ApiProperty({ description: '题解' })
  @Column({
    type: 'longtext',
  })
  answer: string;

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

  @ApiProperty({ description: '更新人id', type: Number })
  @Column({
    name: 'updated_by_id',
  })
  updatedById: number;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'updated_by_id',
    referencedColumnName: 'id',
  })
  updatedBy: User;

  @ApiProperty({ description: '分类code', type: String })
  @Column({
    name: 'category_code',
  })
  categoryCode: string;

  @ManyToOne(() => Category)
  @JoinColumn({
    name: 'category_code',
    referencedColumnName: 'code',
  })
  category: Category;

  @ApiProperty({ description: '状态', enum: QuestionStatus })
  @Column({
    type: 'enum',
    enum: QuestionStatus,
    default: QuestionStatus.Published,
  })
  status: QuestionStatus;

  @BeforeInsert()
  private syncUpdatedBy() {
    if (!!this.updatedById) return;
    this.updatedById = this.createdById;
  }

  /**
   * @description 问题点有效的状态
   */
  static get validStatuses() {
    return [QuestionStatus.Published];
  }
}
