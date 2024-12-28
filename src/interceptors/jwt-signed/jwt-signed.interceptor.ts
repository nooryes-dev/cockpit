import { User } from '@/libs/database';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { map, Observable } from 'rxjs';

@Injectable()
export class JwtSignedInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<string> {
    return next.handle().pipe(
      map((user) => {
        return this.jwtService.sign(user);
      }),
    );
  }
}
