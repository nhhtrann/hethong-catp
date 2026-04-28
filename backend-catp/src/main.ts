import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Thay đổi dòng này để sử dụng Express làm nền tảng
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors();

  // Cấu hình: Khi truy cập http://localhost:3000/uploads/... sẽ thấy ảnh
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(3000);
}
bootstrap();