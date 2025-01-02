import { Category } from '@/libs/database';
import { ApiSchema, PickType } from '@nestjs/swagger';

@ApiSchema({ description: '创建分类' })
export class CreateCategoryDto extends PickType(Category, ['name', 'logo']) {}
