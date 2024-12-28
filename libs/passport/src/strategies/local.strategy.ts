import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  Dependencies,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
@Dependencies(UserService)
export class LocalStrategy extends PassportStrategy(Strategy) {
  private userService: UserService;

  constructor(userService: UserService) {
    super();
    this.userService = userService;
  }

  async validate(username: string, password: string) {
    const user = await this.userService.validate({ username, password });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
