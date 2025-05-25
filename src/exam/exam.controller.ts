import { Controller, Body, Sse, MessageEvent, Post } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { type Observable } from 'rxjs';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Sse('create')
  @Post('create')
  create(@Body() createExamDto: CreateExamDto): Observable<MessageEvent> {
    return this.examService.create(createExamDto);
  }
}
