import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as _CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [_CacheModule.register()],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
