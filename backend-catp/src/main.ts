// src/main.ts (Backend)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
// 👉 Thêm dòng import này
import { json, urlencoded } from 'express'; 
import { join } from 'path/win32';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors(); // Mở cổng cho React gọi API

  // 👉 BỔ SUNG: Nâng mức giới hạn gửi dữ liệu lên 50 Megabytes
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', 
  });
  await app.listen(3000);
}
bootstrap();