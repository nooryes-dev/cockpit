import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as _ConfigModule } from '@nestjs/config';
import jwt from './configurations/jwt.configuration';

@Global()
@Module({
  imports: [
    _ConfigModule.forRoot({
      load: [jwt],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
