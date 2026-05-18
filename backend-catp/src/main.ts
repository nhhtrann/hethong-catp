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
  
  app.enableCors(); // Mở cổng cho React gọi API

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động vứt bỏ các trường dữ liệu rác (hacker cố tình gửi thêm vào)
    forbidNonWhitelisted: true, // Báo lỗi 400 nếu có trường lạ
    transform: true, // Tự động ép kiểu dữ liệu (vd: từ string '1' sang number 1)
  }));

  // 👉 ĐÃ SỬA: Dùng process.cwd() để lấy đúng thư mục gốc /app trong Docker
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads', // Đã bỏ dấu '/' ở cuối cho chuẩn URL
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(3000);
}
bootstrap();