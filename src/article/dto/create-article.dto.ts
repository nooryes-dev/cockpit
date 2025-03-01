import { Article } from '@/libs/database/entities/article.entity';
import { PickType } from '@nestjs/swagger';

export class CreateArticleDto extends PickType(Article, [
  'title',
  'content',
  'categoryCode',
]) {}
