import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CatchEverythingFilter } from './filters/catch-everything/catch-everything.filter';
import { UnifiedResponseInterceptor } from './interceptors/unified-response/unified-response.interceptor';
import { FailedResponse, SucceedResponse } from 'typings/response';

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
    .addBearerAuth()
    .build();

  SwaggerModule.setup(Token.DocumentPath, app, () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [SucceedResponse, FailedResponse],
    }),
  );

  // 添加全局校验
  app.useGlobalPipes(new ValidationPipe());

  // 添加全局前缀
  app.setGlobalPrefix(Token.GlobalPrefix);

  // 添加全局拦截器
  app.useGlobalInterceptors(new UnifiedResponseInterceptor());

  // 添加全局异常处理
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 3000);

  console.info('接口文档地址：', `http://localhost:3000/${Token.DocumentPath}`);
}
bootstrap();
