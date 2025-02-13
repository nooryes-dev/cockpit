import { Injectable } from '@nestjs/common';
import { CreateTechStackDto } from './dto/create-tech-stack.dto';
import { UpdateTechStackDto } from './dto/update-tech-stack.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TechStack } from '@/libs/database';
import { Repository } from 'typeorm';
import { Pagination } from 'typings/pagination.types';
import { UserService } from 'src/user/user.service';

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
  async techStacks({ page = 1, pageSize = 10 }: Pagination) {
    const [_techStacks, count] = await this.techStackRepository
      .createQueryBuilder()
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
    return this.techStackRepository.findOneBy({ id });
  }
}
