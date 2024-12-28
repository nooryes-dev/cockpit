import { Module } from '@nestjs/common';
import { PassportService } from './passport.service';
import { PassportModule as _PassportModule } from '@nestjs/passport';

@Module({
  imports: [_PassportModule],
  providers: [PassportService],
  exports: [PassportService],
})
export class PassportModule {}
