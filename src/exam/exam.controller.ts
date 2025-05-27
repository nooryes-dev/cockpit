import {
  Controller,
  Body,
  Sse,
  MessageEvent,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { type CreateExamDto } from './dto/create-exam.dto';
import { type Observable } from 'rxjs';
import { type UpdateExamDto } from './dto/submit-exam.dto';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Exam } from '@/libs/database/entities/exam.entity';

@ApiTags('考试')
@ApiExtraModels(Exam)
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '创建考试' })
  @ApiUnifiedResponse(Exam)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '生成考试问题' })
  @UseGuards(JwtAuthGuard)
  @Sse('/questions/:id')
  generateQuestions(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return this.examService.generateQuestions(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '提交考试' })
  @ApiUnifiedResponse({ type: 'boolean' })
  @UseGuards(JwtAuthGuard)
  @Post('submit/:id')
  submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    return this.examService.submit(id, updateExamDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '审查考试内容' })
  @UseGuards(JwtAuthGuard)
  @Sse('/review/:id')
  review(@Param('id', ParseIntPipe) id: number) {
    return this.examService.review(id);
  }
}
