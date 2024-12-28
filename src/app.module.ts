import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule, ConfigService } from '@/libs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // 配置模块
    ConfigModule,
    // jwt 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        console.log('configService.jwtSecret====', configService.jwtSecret);

        return {
          secret: configService.jwtSecret,
        };
      },
    }),
    // 用户模块
    UserModule,
    // 认证模块
    AuthenticationModule,
  ],
})
export class AppModule {}
