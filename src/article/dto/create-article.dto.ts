import { Article } from '@/libs/database/entities/article.entity';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class CreateArticleDto extends PickType(Article, ['title', 'content']) {
  @ApiProperty({
    description: '关联分类codes',
  })
  categoryCodes: string[];
}
