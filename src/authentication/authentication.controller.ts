import { Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('认证')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @ApiOperation({ description: '登录' })
  @Post('sign-in')
  signIn() {
    return console.log('登录成功');
  }

  @ApiOperation({ description: '注册' })
  @Post('sign-up')
  signUp() {
    return console.log('注册成功');
  }
}
