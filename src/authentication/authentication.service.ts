import { ConfigService } from '@/libs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * @description 获取配置中的非对称私钥
   */
  getPrivateKey() {
    const privateKey = this.configService.rsaPrivateKey;

    if (!privateKey) {
      throw new Error('应用初始化非对称秘钥失败，请联系管理员！');
    }

    return privateKey;
  }
}
