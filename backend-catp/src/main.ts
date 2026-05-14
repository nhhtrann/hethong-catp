// src/main.ts (Backend)
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
// 👉 Thêm dòng import này
import { json, urlencoded } from 'express'; 
import { join } from 'path/win32';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors(); // Mở cổng cho React gọi API

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động vứt bỏ các trường dữ liệu rác (hacker cố tình gửi thêm vào)
    forbidNonWhitelisted: true, // Báo lỗi 400 nếu có trường lạ
    transform: true, // Tự động ép kiểu dữ liệu (vd: từ string '1' sang number 1)
  }));

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', 
  });
  await app.listen(3000);
}
bootstrap();