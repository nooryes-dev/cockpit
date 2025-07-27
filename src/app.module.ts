import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule, ConfigService } from '@/libs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@/libs/passport';
import { DatabaseModule } from '@/libs/database';
import { TechStackModule } from './tech-stack/tech-stack.module';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { QuestionModule } from './question/question.module';
import { ExamModule } from './exam/exam.module';
import { CacheModule } from '@/libs/cache';

@Module({
  imports: [
    // 配置模块
    ConfigModule,
    // 缓存模块
    CacheModule,
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
    // 技术栈
    TechStackModule,
    // 分类模块
    CategoryModule,
    // 知识点模块
    ArticleModule,
    // 问题点模块
    QuestionModule,
    // 考试模块
    ExamModule,
  ],
})
export class AppModule {}
