import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheToken } from './tokens';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * @description 缓存注册验证码
   */
  setRegisterCaptcha(to: string, captcha: string) {
    this.cacheManager.set(
      CacheToken.RegisterCaptcha + to,
      captcha,
      5 * 60 * 1000,
    );
  }

  /**
   * @description 获取注册验证码
   */
  async getRegisterCaptcha(to: string) {
    return await this.cacheManager.get<string>(CacheToken.RegisterCaptcha + to);
  }
}
