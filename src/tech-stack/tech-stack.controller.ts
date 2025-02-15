import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { TechStackService } from './tech-stack.service';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateTechStackDto } from './dto/create-tech-stack.dto';
import { WhoAmI } from 'src/decorators/who-am-i.decorator';
import { TechStack, User } from '@/libs/database';
import { UpdateTechStackDto } from './dto/update-tech-stack.dto';
import { ApiUnifiedPaginatedResponse } from 'src/decorators/api-unified-paginated-response.decorator';
import { PaginatedResponseInterceptor } from 'src/interceptors/paginated-response.interceptor';
import { QueryTechStacksDto } from './dto/query-tech-stacks.dto';

@ApiTags('技术栈')
@ApiExtraModels(TechStack)
@Controller('tech-stack')
export class TechStackController {
  constructor(private readonly techStackService: TechStackService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '创建技术栈' })
  @ApiUnifiedResponse({
    type: 'number',
    description: '技术栈id',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createTechStackDto: CreateTechStackDto,
    @WhoAmI() { id: createdById }: User,
  ) {
    return this.techStackService.create(createTechStackDto, createdById);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '更新技术栈' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTechStackDto: UpdateTechStackDto,
    @WhoAmI() { id: updatedById }: User,
  ) {
    return this.techStackService.update(id, updateTechStackDto, updatedById);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '删除技术栈' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @WhoAmI() { id: deletedById }: User,
  ) {
    return this.techStackService.remove(id, deletedById);
  }

  @ApiOperation({ summary: '获取技术栈列表' })
  @ApiUnifiedPaginatedResponse(TechStack)
  @UseInterceptors(PaginatedResponseInterceptor)
  @Get('list')
  techStacks(@Query() params: QueryTechStacksDto) {
    return this.techStackService.techStacks(params);
  }

  @ApiOperation({ summary: '获取技术栈详情' })
  @ApiUnifiedResponse(TechStack)
  @Get(':id')
  techStack(@Param('id', ParseIntPipe) id: number) {
    return this.techStackService.techStack(id);
  }
}
