import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { _Preset } from './_preset.entity';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@ApiSchema({ description: '技术栈' })
@Entity({
  name: 'tech-stack',
})
export class TechStack extends _Preset {
  @ApiProperty({ description: '名称' })
  @Column({
    type: 'varchar',
    length: 20,
  })
  name: string;

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

  @BeforeInsert()
  private syncUpdatedBy() {
    if (!!this.updatedById) return;
    this.updatedById = this.createdById;
  }
}
