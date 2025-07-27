import { ConfigService } from '@/libs/config';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { STS } from 'ali-oss';
import Dm20151123 from '@alicloud/dm20151123';
import {
  Params,
  OpenApiRequest,
  Config as OpenApiConfig,
} from '@alicloud/openapi-client';
import Credential, { Config } from '@alicloud/credentials';
import { RuntimeOptions } from '@alicloud/tea-util';
import { SendRegisterCaptchaDto } from '../authentication/dto/send-register-captcha.dto';
import { CacheService } from '@/libs/cache';

@Injectable()
export class AuthenticationService {
  private readonly aliyunOssSts: STS;
  private readonly captchaSender: Dm20151123;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {
    // 初始化阿里云 STS 实例
    this.aliyunOssSts = new STS({
      accessKeyId: this.configService.aliyunAccessKeyId,
      accessKeySecret: this.configService.aliyunAccessKeySecret,
    });

    // 初始化邮件发送实例
    const credential = new Credential(
      new Config({
        type: 'access_key',
        accessKeyId: configService.aliyunAccessKeyId,
        accessKeySecret: configService.aliyunAccessKeySecret,
      }),
    );

    const config = new OpenApiConfig({
      credential: credential,
    });
    config.endpoint = `dm.aliyuncs.com`;

    this.captchaSender = new Dm20151123(config);
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
  async signUp({ password, captcha, ..._signUp }: SignUpDto) {
    // 校验注册验证码是否匹配
    const isCaptchaValid =
      captcha === (await this.cacheService.getRegisterCaptcha(_signUp.email));

    if (!isCaptchaValid) {
      throw new BadRequestException('验证码校验错误');
    }

    const _user = await this.userService.signUp({
      ..._signUp,
      password: this.userService.decryptByRsaPrivateKey(password),
    });

    return _user;
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

  /**
   * @description 发送注册邮件
   */
  async sendRegisterCaptcha(sendRegisterCaptchaDto: SendRegisterCaptchaDto) {
    const params = new Params({
      action: 'SingleSendMail',
      version: '2015-11-23',
      protocol: 'HTTPS',
      method: 'POST',
      authType: 'AK',
      style: 'RPC',
      pathname: `/`,
      reqBodyType: 'formData',
      bodyType: 'json',
    });

    const _captcha = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    await this.captchaSender.callApi(
      params,
      new OpenApiRequest({
        body: {
          AccountName: 'support@account.nooryes.cn',
          AddressType: 1,
          ReplyToAddress: false,
          ToAddress: sendRegisterCaptchaDto.to,
          Subject: '验证码',
          TextBody: _captcha,
        },
      }),
      new RuntimeOptions(),
    );

    this.cacheService.setRegisterCaptcha(sendRegisterCaptchaDto.to, _captcha);
    return true;
  }
}
