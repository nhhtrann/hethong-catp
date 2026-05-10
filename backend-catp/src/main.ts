// src/main.ts (Backend)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 👉 Thêm dòng import này
import { json, urlencoded } from 'express'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors(); // Mở cổng cho React gọi API

  // 👉 BỔ SUNG: Nâng mức giới hạn gửi dữ liệu lên 50 Megabytes
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(3000);
}
bootstrap();