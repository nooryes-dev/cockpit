import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { DataSource, In, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @description 创建文章
   */
  async create(createArticleDto: CreateArticleDto, createdBy: User) {
    const categories = await this.categoryRepository.findBy({
      code: In(createArticleDto.categoryCodes),
    });

    return (
      await this.articleRepository.save(
        this.articleRepository.create({
          title: createArticleDto.title,
          content: createArticleDto.content,
          createdById: createdBy.id,
          categories,
        }),
      )
    ).id;
  }

  /**
   * @description 更新文章
   */
  async update(
    id: number,
    { categoryCodes = [], ...updateArticleDto }: UpdateArticleDto,
    user: User,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      await this.articleRepository.update(
        id,
        this.articleRepository.create({
          ...updateArticleDto,
          updatedById: user.id,
        }),
      );

      await this.articleRepository
        .createQueryBuilder()
        .relation('categories')
        .of(id)
        .addAndRemove(
          categoryCodes,
          await this.articleRepository
            .createQueryBuilder()
            .relation('categories')
            .of(id)
            .loadMany<Category>(),
        );

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return false;
    }
  }

  /**
   * @description 分页获取文章列表
   */
  async articles({
    page,
    pageSize,
    categoryCodes = [],
    keyword,
  }: QueryArticlesDto) {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.categories', 'category')
      .where('1 = 1')
      .orderBy('article.id')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (categoryCodes.length > 0) {
      qb.andWhere('category.code IN (:...categoryCodes)', { categoryCodes });
    }

    if (!!keyword) {
      qb.andWhere('article.title REGEXP :keyword', { keyword });
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
      relations: {
        categories: true,
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
