import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '@/libs/database';
import { Question } from '@/libs/database/entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Category])],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
