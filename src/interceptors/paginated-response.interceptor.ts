import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Paginated } from 'typings/pagination.types';

interface _Request {
  query: {
    page?: number;
    pageSize?: number;
  };
}

@Injectable()
export class PaginatedResponseInterceptor<T = unknown>
  implements NestInterceptor
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<[T[], number]>,
  ): Observable<Paginated<T>> {
    const query = context.switchToHttp().getRequest<_Request>().query;

    return next.handle().pipe(
      map(({ 0: items = [], 1: total = 0 }) => {
        return {
          items,
          total,
          page: +(query.page || 1),
          pageSize: +(query.pageSize || 10),
        };
      }),
    );
  }
}
