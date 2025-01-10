import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@/libs/config';
import { User } from './entities/user.entity';
import { TechStack } from './entities/tech-stack.entity';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          database: configService.appCode,
          entities: [User, TechStack, Category],
          synchronize: true,
        };
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
