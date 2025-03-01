import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { _Preset } from './_preset.entity';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from './user.entity';
import { TechStack } from './tech-stack.entity';
import { Article } from './article.entity';

@ApiSchema({ description: '分类' })
@Entity({
  name: 'category',
})
export class Category extends _Preset {
  @ApiProperty({ description: '分类code' })
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  code: string;

  @ApiProperty({ description: '分类名称' })
  @Column({
    type: 'varchar',
    length: 20,
  })
  name: string;

  @ApiProperty({
    description: '分类图标',
    type: String,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  logo: string | null;

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

  @ApiProperty({ description: '技术栈code', type: String })
  @Column({
    name: 'tech_stack_code',
  })
  techStackCode: string;

  @ManyToOne(() => TechStack)
  @JoinColumn({
    name: 'tech_stack_code',
    referencedColumnName: 'code',
  })
  techStack: TechStack;

  @ManyToMany(() => Article, (article) => article.categories)
  articles: Article[];

  @BeforeInsert()
  private syncUpdatedBy() {
    if (!!this.updatedById) return;
    this.updatedById = this.createdById;
  }
}
