import { User } from '@/libs/database';
import { Nullable } from '@aiszlab/relax/types';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatusCode } from 'typings/response.types';
import { AnyException } from 'utils/exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private isStrict: boolean = true;

  constructor(isStrict = true) {
    super();
    this.isStrict = isStrict;
  }

  handleRequest<U extends User>(error: Nullable<Error>, user?: U): Nullable<U> {
    if (error || !user) {
      // 如果不是严格模式，返回 null，不抛出异常
      if (!this.isStrict) {
        return null;
      }

      throw new AnyException({
        statusCode: StatusCode.Unauthorized,
        message: error?.message ?? StatusCode.Unauthorized,
      });
    }

    return user;
  }
}
