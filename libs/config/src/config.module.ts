import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as _ConfigModule } from '@nestjs/config';
import jwt from './configurations/jwt.configuration';
import app from './configurations/app.configuration';
import rsa from './configurations/rsa.configuration';
import aliyun from './configurations/aliyun.configuration';

@Global()
@Module({
  imports: [
    _ConfigModule.forRoot({
      load: [jwt, app, rsa, aliyun],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
