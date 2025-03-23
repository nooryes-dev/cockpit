import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Repository } from 'typeorm';
import {
  Article,
  ArticleStatus,
} from '@/libs/database/entities/article.entity';
import { User } from '@/libs/database';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SearchArticlesDto,
  SearchedArticleDto,
} from './dto/search-articles.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
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
          createdById: createdBy.id,
          categoryCode: createArticleDto.categoryCode,
        }),
      )
    ).id;
  }

  /**
   * @description 更新文章
   */
  async update(id: string, updateArticleDto: UpdateArticleDto, user: User) {
    return (
      ((
        await this.articleRepository.update(
          id,
          this.articleRepository.create({
            ...updateArticleDto,
            updatedById: user.id,
          }),
        )
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description 分页获取文章列表
   * 接口用于管理端页面：
   * 1. 不需要过滤状态
   */
  async articles({ page, pageSize, categoryCode, keyword }: QueryArticlesDto) {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .where('1 = 1')
      .orderBy('article.id')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (!!categoryCode) {
      qb.andWhere('article.categoryCode = :categoryCode', { categoryCode });
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

  /**
   * @description 查询文章详情
   */
  article(id: string) {
    return this.articleRepository.findOne({
      where: {
        id,
      },
      relations: {
        category: true,
      },
    });
  }

  /**
   * @description 删除文章
   */
  async remove(id: string, user: User) {
    return (
      ((
        await this.articleRepository.update(id, {
          deletedAt: new Date(),
          updatedById: user.id,
        })
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description C端搜索文章
   * 1. 过滤文章状态在有效范围内
   */
  async search({
    categoryCode,
    keyword,
    page = 1,
    pageSize = 10,
  }: SearchArticlesDto) {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .where('article.status IN (:...articleStatuses)', {
        articleStatuses: Article.validStatuses,
      })
      .orderBy('article.id')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (!!categoryCode) {
      qb.andWhere('article.categoryCode = :categoryCode', { categoryCode });
    }

    if (!!keyword) {
      qb.andWhere('article.title REGEXP :keyword', { keyword });
    }

    const [_articles, count] = await qb.getManyAndCount();

    return [
      _articles.map<SearchedArticleDto>((_article) => {
        return {
          id: _article.id,
          title: _article.title,
          content: _article.content,
          categoryCode: _article.categoryCode,
        };
      }),
      count,
    ] as const;
  }

  /**
   * @description 查询热门的知识点
   * 1. 过滤文章状态在有效范围内
   */
  async hot() {
    return (
      await this.articleRepository
        .createQueryBuilder('article')
        .where('article.status IN (:...articleStatuses)', {
          articleStatuses: Article.validStatuses,
        })
        .limit(10)
        .orderBy({
          'article.updatedAt': 'DESC',
        })
        .getMany()
    ).map<SearchedArticleDto>((_article) => {
      return {
        id: _article.id,
        title: _article.title,
        content: _article.content,
        categoryCode: _article.categoryCode,
      };
    });
  }

  /**
   * @description 更新文章状态
   */
  async updateStatus(id: string, status: ArticleStatus) {
    return (
      ((
        await this.articleRepository.update(id, {
          status,
        })
      ).affected ?? 0) > 0
    );
  }
}
