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
import {
  CountByTechStackCodeDto,
  CountedByTechStackCodeDto,
} from './dto/count-by-tech-stack.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 创建知识点
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
   * @description 更新知识点
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
   * @description 分页获取知识点列表
   * 接口用于管理端页面：
   * 1. 不需要过滤状态
   */
  async articles({ page, pageSize, categoryCode, keyword }: QueryArticlesDto) {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .where('1 = 1')
      .offset((page - 1) * pageSize)
      .orderBy('article.updatedAt', 'DESC')
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
   * @description 查询知识点详情
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
   * @description 删除知识点
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
   * @description C端搜索知识点
   * 1. 过滤知识点状态在有效范围内
   */
  async search({
    categoryCode,
    keyword,
    page = 1,
    pageSize = 10,
    hasContent = 'y',
    sequence = 'ASC',
  }: SearchArticlesDto) {
    // 如果没有传入categoryCode，那么pageSize最多为20
    if (!categoryCode) {
      pageSize = Math.min(pageSize, 20);
    }

    const qb = this.articleRepository
      .createQueryBuilder('article')
      .where('article.status IN (:...articleStatuses)', {
        articleStatuses: Article.validStatuses,
      })
      .leftJoinAndMapOne('article.category', 'article.category', 'category')
      .leftJoinAndMapOne(
        'category.techStack',
        'category.techStack',
        'techStack',
      )
      .orderBy('article.updatedAt', sequence)
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
          content: hasContent === 'y' ? _article.content : undefined,
          categoryCode: _article.categoryCode,
          categoryName: _article.category.name,
          techStackCode: _article.category.techStack.code,
        };
      }),
      count,
    ] as const;
  }

  /**
   * @description 查询热门的知识点
   * 1. 过滤知识点状态在有效范围内
   */
  async hot() {
    return (
      await this.articleRepository
        .createQueryBuilder('article')
        .where('article.status IN (:...articleStatuses)', {
          articleStatuses: Article.validStatuses,
        })
        .leftJoinAndMapOne('article.category', 'article.category', 'category')
        .leftJoinAndMapOne(
          'category.techStack',
          'category.techStack',
          'techStack',
        )
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
        categoryName: _article.category.name,
        techStackCode: _article.category.techStack.code,
      };
    });
  }

  /**
   * @description 更新知识点状态
   */
  async updateStatus(id: string, status: ArticleStatus, updatedById: number) {
    return (
      ((
        await this.articleRepository.update(id, {
          status,
          updatedById,
        })
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description 按技术栈统计知识点数量
   */
  async countByTechStackCode({ techStackCode }: CountByTechStackCodeDto) {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .select('COUNT(*)', 'total')
      .where('article.status IN (:...articleStatuses)', {
        articleStatuses: Article.validStatuses,
      });

    if (techStackCode) {
      qb.andWhere('category.techStackCode = :techStackCode', { techStackCode });
    }

    return await qb.getRawOne<CountedByTechStackCodeDto>();
  }
}
