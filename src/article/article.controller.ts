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
  Query,
  ParseArrayPipe,
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
} from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { WhoAmI } from 'src/decorators/who-am-i.decorator';
import { User } from '@/libs/database';
import { ApiUnifiedPaginatedResponse } from 'src/decorators/api-unified-paginated-response.decorator';
import { Article } from '@/libs/database/entities/article.entity';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { PaginatedResponseInterceptor } from 'src/interceptors/paginated-response.interceptor';

@ApiTags('文章')
@ApiExtraModels(Article)
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
    @Param('id', ParseIntPipe) id: number,
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
  remove(@Param('id', ParseIntPipe) id: number, @WhoAmI() user: User) {
    return this.articleService.remove(id, user);
  }

  @ApiOperation({ summary: '分页获取文章列表' })
  @ApiUnifiedPaginatedResponse(Article)
  @UseInterceptors(PaginatedResponseInterceptor)
  @Get('list')
  articles(
    @Query() queryCategoriesDto: QueryArticlesDto,
    @Query('categoryCodes', new ParseArrayPipe({ optional: true }))
    categoryCodes: QueryArticlesDto['categoryCodes'],
  ) {
    return this.articleService.articles({
      ...queryCategoriesDto,
      categoryCodes,
    });
  }

  @ApiOperation({ summary: '获取文章详情' })
  @ApiUnifiedResponse(Article)
  @Get(':id')
  article(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.article(id);
  }
}
