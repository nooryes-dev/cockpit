import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { StatusCode, UnifiedResponse } from 'typings/response.types';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapter: AbstractHttpAdapter) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const responseBody: UnifiedResponse = {
      statusCode: StatusCode.Fail,
      message: exception.message,
    };

    this.httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.OK);
  }
}
