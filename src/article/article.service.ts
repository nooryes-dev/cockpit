import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Repository } from 'typeorm';
import { Article } from '@/libs/database/entities/article.entity';
import { User } from '@/libs/database';

@Injectable()
export class ArticleService {
  constructor(private readonly articleReposity: Repository<Article>) {}

  /**
   * @description 创建文章
   */
  async create(createArticleDto: CreateArticleDto, createdBy: User) {
    return (
      await this.articleReposity.save(
        this.articleReposity.create({
          title: createArticleDto.title,
          content: createArticleDto.content,
          categoryCode: createArticleDto.categoryCode,
          createdById: createdBy.id,
        }),
      )
    ).id;
  }

  /**
   * @description 更新文章
   */

  findAll() {
    return `This action returns all article`;
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
