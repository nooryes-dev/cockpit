import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [
    // 用户模块
    UserModule,
    // 认证模块
    AuthenticationModule,
  ],
})
export class AppModule {}
