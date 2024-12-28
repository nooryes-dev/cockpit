import { Controller, Get, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response/api-unified-response.decorator';

@ApiTags('认证')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @ApiOperation({ description: '登录' })
  @ApiUnifiedResponse({ type: 'string', description: 'jwt token' })
  @Post('sign-in')
  signIn() {
    return '12321321';
  }

  @ApiOperation({ description: '注册' })
  @ApiUnifiedResponse({ type: 'string', description: 'jwt token' })
  @Post('sign-up')
  signUp() {
    return '12321321';
  }

  @ApiOperation({ description: '获取非对称私钥' })
  @ApiUnifiedResponse({ type: 'string', description: '非对称私钥' })
  @Get('private-key')
  getPrivateKey() {
    return this.authenticationService.getPrivateKey();
  }
}
