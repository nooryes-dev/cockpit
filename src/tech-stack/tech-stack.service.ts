import { Injectable } from '@nestjs/common';
import { CreateTechStackDto } from './dto/create-tech-stack.dto';
import { UpdateTechStackDto } from './dto/update-tech-stack.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TechStack } from '@/libs/database';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { QueryTechStacksDto } from './dto/query-tech-stacks.dto';
import {
  SearchedTechStackDto,
  SearchTechStacksDto,
} from './dto/search-tech-stacks.dto';

@Injectable()
export class TechStackService {
  constructor(
    @InjectRepository(TechStack)
    private readonly techStackRepository: Repository<TechStack>,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 创建技术栈
   */
  async create(createTechStackDto: CreateTechStackDto, createdById: number) {
    return (
      await this.techStackRepository.save(
        this.techStackRepository.create({
          ...createTechStackDto,
          createdById,
        }),
      )
    ).id;
  }

  /**
   * @description 更新技术栈
   */
  async update(
    id: number,
    updateTechStackDto: UpdateTechStackDto,
    updatedById: number,
  ) {
    return (
      ((
        await this.techStackRepository.update(
          id,
          this.techStackRepository.create({
            ...updateTechStackDto,
            updatedById,
          }),
        )
      ).affected ?? 0) > 0
    );
  }

  /**
   * @description 删除技术栈
   */
  async remove(id: number, deletedById: number) {
    return (
      (
        await this.techStackRepository.update(
          id,
          this.techStackRepository.create({
            deletedAt: new Date(),
            updatedById: deletedById,
          }),
        )
      ).affected ?? 0 > 0
    );
  }

  /**
   * @description 分页获取技术栈列表
   */
  async techStacks({
    page = 1,
    pageSize = 10,
    code,
    name,
  }: QueryTechStacksDto) {
    const qb = this.techStackRepository
      .createQueryBuilder('techStack')
      .where('1 = 1');

    if (!!code) {
      qb.andWhere('techStack.code REGEXP :code', { code });
    }

    if (!!name) {
      qb.andWhere('techStack.name REGEXP :name', { name });
    }

    const [_techStacks, count] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return [
      await this.userService.getUsersByIds(_techStacks, {
        createdById: 'createdBy',
        updatedById: 'updatedBy',
      }),
      count,
    ];
  }

  /**
   * @description 获取技术栈详情
   */
  techStack(id: number) {
    return this.techStackRepository.findOne({
      where: { id },
      relations: {
        createdBy: true,
        updatedBy: true,
      },
    });
  }

  /**
   * @description C端搜索技术栈列表
   */
  async search({ keyword }: SearchTechStacksDto) {
    const qb = this.techStackRepository
      .createQueryBuilder('techStack')
      .select('techStack.code', 'code')
      .addSelect('techStack.name', 'name');

    if (!!keyword) {
      qb.where('techStack.code REGEXP :keyword', { keyword }).orWhere(
        'techStack.name REGEXP :keyword',
        { keyword },
      );
    }

    return await qb.skip(0).take(50).getRawMany<SearchedTechStackDto>();
  }
}
