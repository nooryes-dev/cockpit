import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule, ConfigService } from '@/libs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@/libs/passport';
import { DatabaseModule } from '@/libs/database';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule,
    // 数据库模块
    DatabaseModule,
    // jwt 模块
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          secret: configService.jwtSecret,
        };
      },
      global: true,
    }),
    // 认证模块
    PassportModule,
    // 用户模块
    UserModule,
    // 认证模块
    AuthenticationModule,
    // 分类模块
    CategoryModule,
  ],
})
export class AppModule {}
