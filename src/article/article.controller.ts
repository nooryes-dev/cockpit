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

@ApiTags('文章')
@ApiExtraModels(Article, SearchedArticleDto)
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '创建文章' })
  @ApiUnifiedResponse({
    type: 'number',
    description: '文章id',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createArticleDto: CreateArticleDto, @WhoAmI() user: User) {
    return this.articleService.create(createArticleDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '更新文章' })
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
  @ApiOperation({ summary: '删除文章' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @WhoAmI() user: User) {
    return this.articleService.remove(id, user);
  }

  @ApiOperation({ summary: '分页获取文章列表' })
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

  @ApiOperation({ summary: '获取文章详情' })
  @ApiUnifiedResponse(Article)
  @Get(':id')
  article(@Param('id') id: string) {
    return this.articleService.article(id);
  }

  @ApiOperation({ summary: '发布文章' })
  @ApiUnifiedResponse(Article)
  @Patch('publish/:id')
  publish(@Param('id') id: string) {
    return this.articleService.updateStatus(id, ArticleStatus.Published);
  }

  @ApiOperation({ summary: '撤回文章' })
  @ApiUnifiedResponse(Article)
  @Patch('withdraw/:id')
  withdraw(@Param('id') id: string) {
    return this.articleService.updateStatus(id, ArticleStatus.Withdrawn);
  }
}
