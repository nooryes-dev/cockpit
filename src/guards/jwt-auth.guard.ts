import { User } from '@/libs/database';
import { Nullable } from '@aiszlab/relax/types';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StatusCode } from 'typings/response.types';
import { AnyException } from 'utils/exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<U extends User>(error: Nullable<Error>, user?: U): U {
    if (error || !user) {
      throw new AnyException({
        statusCode: StatusCode.Unauthorized,
        message: error?.message ?? StatusCode.Unauthorized,
      });
    }

    return user;
  }
}
