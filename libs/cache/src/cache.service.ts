import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheToken } from './tokens';
import dayjs from 'dayjs';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 缓存注册验证码
   */
  setRegisterCaptcha(to: string, captcha: string) {
    this.cacheManager.set(
      CacheToken.RegisterCaptcha + to,
      captcha,
      5 * 60 * 1000,
    );
  }

  /**
   * 获取注册验证码
   */
  async getRegisterCaptcha(to: string) {
    return await this.cacheManager.get<string>(CacheToken.RegisterCaptcha + to);
  }

  /**
   * 用户面试间免费额度
   */
  async getExamFreeQuota(who: number) {
    return await this.cacheManager.get<number>(CacheToken.ExamFreeQuota + who);
  }

  /**
   * 更新用户面试间免费额度
   */
  async increaseExamFreeQuota(who: number) {
    const quota = (await this.getExamFreeQuota(who)) ?? 0;
    if (quota >= 3) {
      throw new BadRequestException('你今天已经使用完面试间免费额度了');
    }

    const ttl = dayjs().endOf('day').valueOf() - dayjs().valueOf();
    return await this.cacheManager.set(
      CacheToken.ExamFreeQuota + who,
      quota + 1,
      Math.max(ttl, 1),
    );
  }
}
