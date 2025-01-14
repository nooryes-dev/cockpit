import { Category } from '@/libs/database';
import { ApiProperty, ApiSchema, PickType } from '@nestjs/swagger';

@ApiSchema({ description: '创建分类' })
export class CreateCategoryDto extends PickType(Category, [
  'code',
  'name',
  'techStackCode',
]) {
  @ApiProperty({
    description: '分类图标',
    type: String,
    nullable: true,
    required: false,
  })
  logo?: string | null;
}
