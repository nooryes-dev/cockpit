import { Module } from '@nestjs/common';
import { PassportModule as _PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [_PassportModule],
  providers: [JwtStrategy],
  exports: [],
})
export class PassportModule {}
