import { Module } from '@nestjs/common';
import { PassportModule as _PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [_PassportModule],
  providers: [JwtStrategy, LocalStrategy],
  exports: [],
})
export class PassportModule {}
