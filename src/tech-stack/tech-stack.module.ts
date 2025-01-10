import { Module } from '@nestjs/common';
import { TechStackService } from './tech-stack.service';
import { TechStackController } from './tech-stack.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechStack } from '@/libs/database';

@Module({
  imports: [TypeOrmModule.forFeature([TechStack])],
  controllers: [TechStackController],
  providers: [TechStackService],
})
export class TechStackModule {}
