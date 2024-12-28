import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { StatusCode, UnifiedResponse } from 'typings/response';

@Injectable()
export class UnifiedResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown | undefined>,
  ): Observable<UnifiedResponse> {
    return next.handle().pipe(
      map((data = null) => {
        return {
          statusCode: StatusCode.Success,
          data,
        };
      }),
    );
  }
}
