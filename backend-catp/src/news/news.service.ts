import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  // 1. Hàm Thêm mới
  create(createNewsDto: any) {
    const newArticle = this.newsRepository.create(createNewsDto);
    return this.newsRepository.save(newArticle);
  }

  // 2. Hàm Lấy tất cả
  findAll() {
    return this.newsRepository.find({ order: { ngayDang: 'DESC' } }); 
  }

  // 3. Hàm Lấy 1 bài cụ thể
  findOne(id: number) {
    return this.newsRepository.findOne({ where: { id } });
  }

  // 4. Hàm SỬA bài viết (ĐÃ BỔ SUNG)
  async update(id: number, updateNewsDto: any) {
    const article = await this.newsRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Không tìm thấy bài viết số ${id}`);
    }
    
    // Ghi đè dữ liệu mới lên bài viết cũ
    Object.assign(article, updateNewsDto);
    return this.newsRepository.save(article);
  }

  // 5. Hàm XÓA bài viết (ĐÃ BỔ SUNG)
  async remove(id: number) {
    const article = await this.newsRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Không tìm thấy bài viết số ${id}`);
    }
    return this.newsRepository.remove(article);
  }
}