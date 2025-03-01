import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Repository } from 'typeorm';
import { Article } from '@/libs/database/entities/article.entity';
import { Category, User } from '@/libs/database';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 创建文章
   */
  async create(createArticleDto: CreateArticleDto, createdBy: User) {
    return (
      await this.articleRepository.save(
        this.articleRepository.create({
          title: createArticleDto.title,
          content: createArticleDto.content,
          categories: createArticleDto.categoryCodes.map((code) =>
            this.categoryRepository.create({ code }),
          ),
          createdById: createdBy.id,
        }),
      )
    ).id;
  }

  /**
   * @description 更新文章
   */
  async update(id: number, updateArticleDto: UpdateArticleDto, user: User) {
    return (
      ((
        await this.articleRepository.update(id, {
          title: updateArticleDto.title,
          categories: updateArticleDto.categoryCodes?.map((code) =>
            this.categoryRepository.create({ code }),
          ),
          content: updateArticleDto.content,
          updatedById: user.id,
        })
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description 分页获取文章列表
   */
  async articles({ page, pageSize, categoryCodes = [] }: QueryArticlesDto) {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .where('1 = 1')
      .innerJoinAndMapMany('article.categories', Category, 'category')
      .orderBy('article.id')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (categoryCodes.length > 0) {
      qb.andWhere('category.code IN (:...categoryCodes)', { categoryCodes });
    }

    const [_articles, count] = await qb.getManyAndCount();

    return [
      await this.userService.getUsersByIds(_articles, {
        createdById: 'createdBy',
        updatedById: 'updatedBy',
      }),
      count,
    ];
  }

  article(id: number) {
    return this.articleRepository.findOne({
      where: {
        id,
      },
    });
  }

  /**
   * @description 删除文章
   */
  async remove(id: number, user: User) {
    return (
      ((
        await this.articleRepository.update(id, {
          deletedAt: new Date(),
          updatedById: user.id,
        })
      ).affected ?? 0) > 0
    );
  }
}
