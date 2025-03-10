import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { _Preset } from './_preset.entity';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from './user.entity';
import { Category } from './category.entity';

@ApiSchema({ description: '问题' })
@Entity({
  name: 'question',
})
export class Question extends _Preset {
  @ApiProperty({ description: '题目' })
  @Column({
    type: 'longtext',
  })
  topic: string;

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

  @ManyToMany(() => Category, (category) => category.questions, {
    cascade: true,
  })
  @JoinTable({
    name: 'questions_to_categories',
    joinColumn: {
      name: 'question_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_code',
      referencedColumnName: 'code',
    },
  })
  categories: Category[];

  @BeforeInsert()
  private syncUpdatedBy() {
    if (!!this.updatedById) return;
    this.updatedById = this.createdById;
  }
}
