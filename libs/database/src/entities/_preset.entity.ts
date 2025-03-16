import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class _PresetDate {
  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ApiProperty({ description: '上次更新时间' })
  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    select: false,
  })
  deletedAt: Date;
}

export class _Preset extends _PresetDate {
  @ApiProperty({ description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;
}
