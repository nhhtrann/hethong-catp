import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// THÊM 2 DÒNG IMPORT NÀY
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json, urlencoded } from 'express'; 

async function bootstrap() {
  // BƯỚC 1: Đổi NestFactory.create thành NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors(); 
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // BƯỚC 2: CẤP QUYỀN PUBLIC CHO THƯ MỤC "uploads"
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // Khi link là localhost:3000/uploads/... thì sẽ vào thư mục này tìm
  });

  await app.listen(3000);
}
bootstrap();