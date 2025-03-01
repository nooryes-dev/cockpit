import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Article } from '@/libs/database/entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@/libs/database';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Category])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
