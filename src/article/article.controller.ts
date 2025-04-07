import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { WhoAmI } from 'src/decorators/who-am-i.decorator';
import { User } from '@/libs/database';
import { ApiUnifiedPaginatedResponse } from 'src/decorators/api-unified-paginated-response.decorator';
import {
  Article,
  ArticleStatus,
} from '@/libs/database/entities/article.entity';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { PaginatedResponseInterceptor } from 'src/interceptors/paginated-response.interceptor';
import {
  SearchArticlesDto,
  SearchedArticleDto,
} from './dto/search-articles.dto';
import {
  CountByCategoryDto,
  CountedByCategoryDto,
} from './dto/count-by-category.dto';

@ApiTags('知识点')
@ApiExtraModels(Article, SearchedArticleDto, CountedByCategoryDto)
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '创建知识点' })
  @ApiUnifiedResponse({
    type: 'number',
    description: '知识点id',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createArticleDto: CreateArticleDto, @WhoAmI() user: User) {
    return this.articleService.create(createArticleDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '更新知识点' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @WhoAmI() user: User,
  ) {
    return this.articleService.update(id, updateArticleDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '删除知识点' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @WhoAmI() user: User) {
    return this.articleService.remove(id, user);
  }

  @ApiOperation({ summary: '分页获取知识点列表' })
  @ApiUnifiedPaginatedResponse(Article)
  @UseInterceptors(PaginatedResponseInterceptor)
  @Get('list')
  articles(@Query() queryCategoriesDto: QueryArticlesDto) {
    return this.articleService.articles(queryCategoriesDto);
  }

  @ApiOperation({ summary: 'C端页面模糊搜索知识点' })
  @ApiUnifiedPaginatedResponse(SearchedArticleDto)
  @UseInterceptors(PaginatedResponseInterceptor)
  @Get('search')
  search(@Query() searchArticlesDto: SearchArticlesDto) {
    return this.articleService.search(searchArticlesDto);
  }

  @ApiOperation({ summary: '热门知识点' })
  @ApiUnifiedResponse({
    type: 'array',
    items: { $ref: getSchemaPath(SearchedArticleDto) },
  })
  @Get('hot')
  hot() {
    return this.articleService.hot();
  }

  @ApiOperation({ summary: '统计各分类知识点数量' })
  @ApiUnifiedResponse({
    type: 'array',
    items: { $ref: getSchemaPath(CountedByCategoryDto) },
  })
  @Get('count-by-category')
  countByCategory(@Query() countByCategoryDto: CountByCategoryDto) {
    return this.articleService.countByCategory(countByCategoryDto);
  }

  @ApiOperation({ summary: '获取知识点详情' })
  @ApiUnifiedResponse(Article)
  @Get(':id')
  article(@Param('id') id: string) {
    return this.articleService.article(id);
  }

  @ApiOperation({ summary: '发布知识点' })
  @ApiBearerAuth()
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Patch('publish/:id')
  publish(@Param('id') id: string, @WhoAmI() user: User) {
    return this.articleService.updateStatus(
      id,
      ArticleStatus.Published,
      user.id,
    );
  }

  @ApiOperation({ summary: '撤回知识点' })
  @ApiBearerAuth()
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Patch('withdraw/:id')
  withdraw(@Param('id') id: string, @WhoAmI() user: User) {
    return this.articleService.updateStatus(
      id,
      ArticleStatus.Withdrawn,
      user.id,
    );
  }
}
