import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import { StatusCode, UnifiedResponse } from 'typings/response.types';
import { AnyException } from 'utils/exception';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapter: AbstractHttpAdapter) {}

  catch(exception: AnyException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const responseBody: UnifiedResponse = {
      statusCode: exception.statusCode ?? StatusCode.Fail,
      message: exception.message,
    };

    this.httpAdapter.reply(ctx.getResponse(), responseBody, HttpStatus.OK);
  }
}
