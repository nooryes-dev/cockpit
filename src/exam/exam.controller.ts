import {
  Controller,
  Body,
  Sse,
  MessageEvent,
  Post,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { type CreateExamDto } from './dto/create-exam.dto';
import { type Observable } from 'rxjs';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('create')
  create(@Body() createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto);
  }

  @Sse('/generate/:id')
  generate(@Param('id', ParseIntPipe) id: number): Observable<MessageEvent> {
    return this.examService.generate(id);
  }
}
