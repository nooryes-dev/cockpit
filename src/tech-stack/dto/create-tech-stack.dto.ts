import { TechStack } from '@/libs/database';
import { ApiSchema, PickType } from '@nestjs/swagger';

@ApiSchema({ description: '创建技术栈' })
export class CreateTechStackDto extends PickType(TechStack, ['code', 'name']) {}
