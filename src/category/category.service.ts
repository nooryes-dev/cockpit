import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository } from 'typeorm';
import { Category } from '@/libs/database';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 创建分类
   */
  async create(createCategoryDto: CreateCategoryDto, createdById: number) {
    return (
      await this.categoryRepository.save(
        this.categoryRepository.create({
          ...createCategoryDto,
          createdById,
        }),
      )
    ).id;
  }

  /**
   * @description 更新分类
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    updatedById: number,
  ) {
    return (
      ((
        await this.categoryRepository.update(
          id,
          this.categoryRepository.create({
            ...updateCategoryDto,
            updatedById,
          }),
        )
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description 删除分类
   */
  async remove(id: number, deletedById: number) {
    return (
      (
        await this.categoryRepository.update(
          id,
          this.categoryRepository.create({
            deletedAt: new Date(),
            updatedById: deletedById,
          }),
        )
      ).affected ?? 0 > 0
    );
  }

  /**
   * @description 分页获取分类列表
   */
  async categories({
    page = 1,
    pageSize = 10,
    techStackCodes = [],
  }: QueryCategoriesDto) {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .select()
      .orderBy('id')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    if (techStackCodes.length > 0) {
      qb.andWhere('category.techStackCode IN (:...techStackCodes)', {
        techStackCodes: techStackCodes,
      });
    }

    const [_categories, count] = await qb.getManyAndCount();
    return [
      await this.userService.getUsersByIds(_categories, {
        createdById: 'createdBy',
        updatedById: 'updatedBy',
      }),
      count,
    ];
  }

  /**
   * @description 获取分类详情
   */
  category(id: number) {
    return this.categoryRepository.findOneBy({ id });
  }
}
