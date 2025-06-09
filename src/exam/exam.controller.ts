import {
  Controller,
  Body,
  Sse,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Get,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Exam } from '@/libs/database/entities/exam.entity';
import { WhoAmI } from 'src/decorators/who-am-i.decorator';
import { User } from '@/libs/database';
import { ApiUnifiedPaginatedResponse } from 'src/decorators/api-unified-paginated-response.decorator';
import { PaginatedResponseInterceptor } from 'src/interceptors/paginated-response.interceptor';
import { QueryExamsDto } from './dto/query-exams.dto';

@ApiTags('面试间')
@ApiExtraModels(Exam)
@Controller('interview-room')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '创建面试间' })
  @ApiUnifiedResponse(Exam)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createExamDto: CreateExamDto,
    @WhoAmI() { id: createdById }: User,
  ) {
    return this.examService.create(createExamDto, createdById);
  }

  @ApiBearerAuth()
  @Sse('/questions/:id')
  generateQuestions(@Param('id', ParseIntPipe) id: number) {
    return this.examService.generateQuestions(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '提交面试结果' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Post('submit/:id')
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitExamDto: SubmitExamDto,
  ) {
    return this.examService.submit(id, submitExamDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '审查面试内容' })
  @UseGuards(JwtAuthGuard)
  @Sse('/review/:id')
  review(@Param('id', ParseIntPipe) id: number) {
    return this.examService.review(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '分页获取面试间列表' })
  @ApiUnifiedPaginatedResponse(Exam)
  @UseInterceptors(PaginatedResponseInterceptor)
  @UseGuards(JwtAuthGuard)
  @Get('list')
  exams(@Query() queryExamsDto: QueryExamsDto, @WhoAmI() { id }: User) {
    return this.examService.exmas(queryExamsDto, id);
  }
}
