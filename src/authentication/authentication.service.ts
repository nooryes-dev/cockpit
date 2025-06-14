import { ConfigService } from '@/libs/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { STS } from 'ali-oss';

@Injectable()
export class AuthenticationService {
  private readonly aliyunOssSts: STS;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    // 初始化阿里云 STS 实例
    this.aliyunOssSts = new STS({
      accessKeyId: this.configService.aliyunOssAccessKeyId,
      accessKeySecret: this.configService.aliyunOssAccessKeySecret,
    });
  }

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

  /**
   * @description 获取 OSS 临时凭证
   */
  async getOssSts() {
    return await this.aliyunOssSts
      .assumeRole(this.configService.aliyunOssRoleArn)
      .then(({ credentials }) => credentials);
  }

  /**
   * @description 登录
   */
  async signIn(id: number, to: string = 'nooryes-web') {
    const _user = await this.userService.getUserById(id);
    if (!_user) return { id };
    if (to !== this.configService.appBusinessEnd) return _user;

    const isAdmin = this.configService.admins.has(_user.username);
    if (!isAdmin) {
      throw new ForbiddenException('您不是管理员，无法登录后台！');
    }
    return _user;
  }
}
