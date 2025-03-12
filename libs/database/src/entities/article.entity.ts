import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { _Preset } from './_preset.entity';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { User } from './user.entity';
import { Category } from './category.entity';

@ApiSchema({ description: '文章' })
@Entity({
  name: 'article',
})
export class Article extends _Preset {
  @ApiProperty({ description: '文章标题' })
  @Column({
    type: 'varchar',
    length: 50,
  })
  title: string;

  @ApiProperty({ description: '文章正文' })
  @Column({
    type: 'longtext',
  })
  content: string;

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

  @BeforeInsert()
  private syncUpdatedBy() {
    if (!!this.updatedById) return;
    this.updatedById = this.createdById;
  }
}
