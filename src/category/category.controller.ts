import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Get,
  Query,
  UseInterceptors,
  ParseArrayPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WhoAmI } from 'src/decorators/who-am-i.decorator';
import { Category, User } from '@/libs/database';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response.decorator';
import { ApiUnifiedPaginatedResponse } from 'src/decorators/api-unified-paginated-response.decorator';
import { PaginatedResponseInterceptor } from 'src/interceptors/paginated-response.interceptor';
import { QueryCategoriesDto } from './dto/query-categories.dto';

@ApiTags('分类')
@ApiExtraModels(Category)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '创建分类' })
  @ApiUnifiedResponse({
    type: 'number',
    description: '分类id',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @WhoAmI() { id: createdById }: User,
  ) {
    return this.categoryService.create(createCategoryDto, createdById);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '更新分类' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @WhoAmI() { id: updatedById }: User,
  ) {
    return this.categoryService.update(id, updateCategoryDto, updatedById);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '删除分类' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @WhoAmI() { id: deletedById }: User,
  ) {
    return this.categoryService.remove(id, deletedById);
  }

  @ApiOperation({ summary: '获取分类列表' })
  @ApiUnifiedPaginatedResponse(Category)
  @UseInterceptors(PaginatedResponseInterceptor)
  @Get('list')
  categories(
    @Query() queryCategoriesDto: QueryCategoriesDto,
    @Query('techStackCodes', new ParseArrayPipe({ optional: true }))
    techStackCodes: QueryCategoriesDto['techStackCodes'],
  ) {
    return this.categoryService.categories({
      ...queryCategoriesDto,
      techStackCodes,
    });
  }

  @ApiOperation({ summary: '获取分类详情' })
  @ApiUnifiedResponse(Category)
  @Get(':id')
  category(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.category(id);
  }
}
