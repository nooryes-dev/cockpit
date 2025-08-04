import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheToken } from './tokens';
import dayjs from 'dayjs';

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

  /**
   * @description 用户面试间免费额度
   */
  async getExamFreeQuota(who: number) {
    return await this.cacheManager.get<number>(CacheToken.ExamFreeQuota + who);
  }

  /**
   * @description 更新用户面试间免费额度
   */
  async increaseExamFreeQuota(who: number) {
    const _quota = (await this.getExamFreeQuota(who)) ?? 0;
    if (_quota >= 3) {
      throw new BadRequestException('你今天已经使用完面试间免费额度了');
    }

    const _ttl = dayjs().endOf('day').diff(dayjs());
    return await this.cacheManager.set(
      CacheToken.ExamFreeQuota + who,
      _quota + 1,
      _ttl,
    );
  }
}
