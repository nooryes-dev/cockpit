import { ConfigService } from '@/libs/config';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { constants, privateDecrypt } from 'crypto';

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
      password: this.decryptByRsaPrivateKey(password),
    });
  }

  /**
   * @description 利用RSA私钥解密前端传输过来的密文密码
   */
  decryptByRsaPrivateKey(encoding: string): string {
    const privateKey = this.configService.rsaPrivateKey;

    if (!privateKey) {
      return encoding;
    }

    try {
      return privateDecrypt(
        { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
        Buffer.from(encoding, 'base64'),
      ).toString();
    } catch {
      return encoding;
    }
  }
}
