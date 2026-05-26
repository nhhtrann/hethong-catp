// src/main.ts (Backend)
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express'; 

// 👉 ĐÃ SỬA: Đổi từ 'path/win32' thành 'path' chuẩn của Linux/Nodejs
import { join } from 'path'; 

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors(); 

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
    transform: true, 
  }));

  app.useStaticAssets(join(__dirname, '..', 'uploads'));

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(3000, '0.0.0.0');
}
bootstrap();