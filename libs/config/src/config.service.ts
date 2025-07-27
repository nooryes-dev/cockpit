import { Injectable } from '@nestjs/common';
import { ConfigService as _ConfigService } from '@nestjs/config';
import { NameSpaceToken, PropertyToken } from './configurations/tokens';
import { Partialable } from '@aiszlab/relax/types';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: _ConfigService) {}

  #get<T = string>(namespace: NameSpaceToken, property: PropertyToken) {
    return this.configService.get<Partialable<T>>(`${namespace}.${property}`);
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
   * @description 阿里云访问密钥 id
   */
  get aliyunAccessKeyId() {
    return this.#get(NameSpaceToken.Aliyun, PropertyToken.AccessKeyId) ?? '';
  }

  /**
   * @description 阿里云访问密钥 secret
   */
  get aliyunAccessKeySecret() {
    return (
      this.#get(NameSpaceToken.Aliyun, PropertyToken.AccessKeySecret) ?? ''
    );
  }

  /**
   * @description 阿里云 oss 角色 arn
   */
  get aliyunOssRoleArn() {
    return this.#get(NameSpaceToken.Aliyun, PropertyToken.OssRoleArn) ?? '';
  }

  /**
   * @description 获取管理员列表
   */
  get admins() {
    return new Set(
      this.#get<string[]>(NameSpaceToken.Authorization, PropertyToken.Admins),
    );
  }

  /**
   * @description 获取管理端应用code
   */
  get appBusinessEnd() {
    return this.#get(NameSpaceToken.App, PropertyToken.BusinessEnd);
  }

  /**
   * @description 数据库密码
   */
  get databasePassword() {
    return this.#get(NameSpaceToken.Aliyun, PropertyToken.DatabasePassword);
  }

  /**
   * @description 获取数据库连接地址
   */
  get databaseHost() {
    return this.#get(NameSpaceToken.Aliyun, PropertyToken.DatabaseHost);
  }

  /**
   * @description 获取数据库端口
   */
  get databasePort() {
    return this.#get<number>(NameSpaceToken.Aliyun, PropertyToken.DatabasePort);
  }

  /**
   * @description 获取 AI API Key
   */
  get alibabaApiKey() {
    return this.#get<string>(
      NameSpaceToken.Aliyun,
      PropertyToken.AlibabaApiKey,
    );
  }
}
