import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as _ConfigModule } from '@nestjs/config';
import jwt from './configurations/jwt.configuration';
import app from './configurations/app.configuration';
import rsa from './configurations/rsa.configuration';

@Global()
@Module({
  imports: [
    _ConfigModule.forRoot({
      load: [jwt, app, rsa],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
