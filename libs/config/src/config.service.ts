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
}
