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
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
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
import { PaginatedResponseInterceptor } from 'src/interceptors/paginated-response.interceptor';
import { Question } from '@/libs/database/entities/question.entity';
import { QueryQuestionsDto } from './dto/query-questions.dto';
import {
  SearchedQuestionDto,
  SearchQuestionsDto,
} from './dto/search-questions.dto';
import {
  CountByTechStackCodeDto,
  CountedByTechStackCodeDto,
} from './dto/count-by-tech-stack.dto';

@ApiTags('问题点')
@ApiExtraModels(Question, SearchedQuestionDto, CountedByTechStackCodeDto)
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '创建问题点' })
  @ApiUnifiedResponse({
    type: 'number',
    description: '问题点id',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @WhoAmI() user: User) {
    return this.questionService.create(createQuestionDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '更新问题点' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @WhoAmI() user: User,
  ) {
    return this.questionService.update(id, updateQuestionDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '删除问题点' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @WhoAmI() user: User) {
    return this.questionService.remove(id, user);
  }

  @ApiOperation({ summary: '分页获取问题点列表' })
  @ApiUnifiedPaginatedResponse(Question)
  @UseInterceptors(PaginatedResponseInterceptor)
  @Get('list')
  questions(@Query() queryCategoriesDto: QueryQuestionsDto) {
    return this.questionService.questions(queryCategoriesDto);
  }

  @ApiOperation({ summary: 'C端页面模糊搜索问题点' })
  @ApiUnifiedPaginatedResponse(SearchQuestionsDto)
  @UseInterceptors(PaginatedResponseInterceptor)
  @Get('search')
  search(@Query() searchQuestionsDto: SearchQuestionsDto) {
    return this.questionService.search(searchQuestionsDto);
  }

  @ApiOperation({ summary: '热门问题点' })
  @ApiUnifiedResponse({
    type: 'array',
    items: { $ref: getSchemaPath(SearchedQuestionDto) },
  })
  @Get('hot')
  hot() {
    return this.questionService.hot();
  }

  @ApiOperation({ summary: '统计各技术栈问题点数量' })
  @ApiUnifiedResponse(CountedByTechStackCodeDto)
  @Get('count-by-tech-stack')
  countByTechStackCode(
    @Query() countByTechStackCodeDto: CountByTechStackCodeDto,
  ) {
    return this.questionService.countByTechStackCode(countByTechStackCodeDto);
  }

  @ApiOperation({ summary: '获取问题点详情' })
  @ApiUnifiedResponse(Question)
  @Get(':id')
  question(@Param('id') id: string) {
    return this.questionService.question(id);
  }
}
