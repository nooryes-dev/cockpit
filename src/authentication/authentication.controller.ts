import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiUnifiedResponse } from 'src/decorators/api-unified-response.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { WhoAmI } from 'src/decorators/who-am-i.decorator';
import { User } from '@/libs/database';
import { JwtSignedInterceptor } from 'src/interceptors/jwt-signed.interceptor';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { OssStsResponse } from './dto/oss-sts.dto';

@ApiTags('认证')
@ApiExtraModels(OssStsResponse)
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @ApiOperation({ description: '登录' })
  @ApiBody({ type: SignInDto })
  @ApiUnifiedResponse({
    type: 'string',
    description: 'jwt token',
    default: 'jwt-token',
  })
  @UseGuards(AuthGuard('local'))
  @UseInterceptors(JwtSignedInterceptor)
  @Post('sign-in')
  signIn(@WhoAmI() user: User) {
    return user;
  }

  @ApiOperation({ description: '注册' })
  @ApiUnifiedResponse({
    type: 'string',
    description: 'jwt token',
    default: 'jwt-token',
  })
  @UseInterceptors(JwtSignedInterceptor)
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authenticationService.signUp(signUpDto);
  }

  @ApiOperation({ description: '获取非对称公钥' })
  @ApiUnifiedResponse({
    type: 'string',
    description: '非对称公钥',
    default: 'public-key',
  })
  @Get('public-key')
  getPublicKey() {
    return this.authenticationService.getPublicKey();
  }

  @ApiOperation({ description: '获取 OSS 临时凭证' })
  @ApiBearerAuth()
  @ApiUnifiedResponse(OssStsResponse)
  @UseGuards(JwtAuthGuard)
  @Get('oss-sts')
  getOssSts() {
    return this.authenticationService.getOssSts();
  }
}
