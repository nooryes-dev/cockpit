import { Column, Entity } from 'typeorm';
import { _Preset } from './_preset.entity';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ description: '分类' })
@Entity({
  name: 'category',
})
export class Category extends _Preset {
  @ApiProperty({ description: '分类名称' })
  @Column({
    type: 'varchar',
    length: 20,
  })
  name: string;

  @ApiProperty({ description: '分类图标', type: String, nullable: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  logo: string | null;
}
