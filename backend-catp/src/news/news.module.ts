import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { News } from './entities/news.entity'; // Import bảng News

@Module({
  imports: [TypeOrmModule.forFeature([News])], // Kết nối với SQL
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}