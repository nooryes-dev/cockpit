import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

enum Token {
  GlobalPrefix = 'api',
  DocumentPath = 'swagger',
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 生成 swagger 文档
  const config = new DocumentBuilder()
    .setTitle('No or Yes')
    .setDescription('服务端接口文档')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(Token.DocumentPath, app, documentFactory);

  // 添加全局校验
  app.useGlobalPipes(new ValidationPipe());

  // 添加全局前缀
  app.setGlobalPrefix(Token.GlobalPrefix);

  await app.listen(process.env.PORT ?? 3000);

  console.info('接口文档地址：', `http://localhost:3000/${Token.DocumentPath}`);
}
bootstrap();
