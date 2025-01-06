import { Injectable } from '@nestjs/common';
import { ConfigService as _ConfigService } from '@nestjs/config';
import { NameSpaceToken, PropertyToken } from './configurations/tokens';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: _ConfigService) {}

  #get(namespace: NameSpaceToken, property: PropertyToken) {
    return this.configService.get<string>(`${namespace}.${property}`);
  }

  /**
   * @description 获取 jwt 秘钥
   */
  get jwtSecret() {
    return this.#get(NameSpaceToken.Jwt, PropertyToken.Secret);
  }

  /**
   * @description 应用 code
   */
  get appCode() {
    return this.#get(NameSpaceToken.App, PropertyToken.Code);
  }

  /**
   * @description 非对称私钥
   */
  get rsaPrivateKey() {
    return this.#get(NameSpaceToken.Rsa, PropertyToken.PrivateKey);
  }

  /**
   * @description 非对称公钥
   */
  get rsaPublicKey() {
    return this.#get(NameSpaceToken.Rsa, PropertyToken.PublicKey);
  }

  /**
   * @description 阿里云 oss 访问密钥 id
   */
  get aliyunOssAccessKeyId() {
    return this.#get(NameSpaceToken.Aliyun, PropertyToken.OssAccessKeyId) ?? '';
  }

  /**
   * @description 阿里云 oss 访问密钥 secret
   */
  get aliyunOssAccessKeySecret() {
    return (
      this.#get(NameSpaceToken.Aliyun, PropertyToken.OssAccessKeySecret) ?? ''
    );
  }

  /**
   * @description 阿里云 oss 角色 arn
   */
  get aliyunOssRoleArn() {
    return this.#get(NameSpaceToken.Aliyun, PropertyToken.OssRoleArn) ?? '';
  }
}
