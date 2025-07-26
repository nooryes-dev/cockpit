import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Article } from '@/libs/database/entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@/libs/database';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Category]), QuestionModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
