import { ConfigService } from '@/libs/config';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  /**
   * @description 获取配置中的非对称公钥
   */
  getPublicKey() {
    const publicKey = this.configService.rsaPublicKey;

    if (!publicKey) {
      throw new Error('应用初始化非对称秘钥失败，请联系管理员！');
    }

    return publicKey;
  }

  /**
   * @description 注册
   */
  signUp({ password, ..._signUp }: SignUpDto) {
    return this.userService.signUp({
      ..._signUp,
      password: this.userService.decryptByRsaPrivateKey(password),
    });
  }
}
