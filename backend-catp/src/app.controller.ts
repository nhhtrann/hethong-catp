import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller() // Hoặc @Controller('reports') tùy file bạn chọn
export class AppController {

  // THÊM NGUYÊN ĐOẠN API NÀY VÀO TRONG CLASS
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // Lưu vào thư mục uploads
      filename: (req, file, callback) => {
        // Tạo tên file ngẫu nhiên để không bị đè ảnh (Ví dụ: 1715000000-hinhanh.jpg)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Trả về cái tên file mới cho Frontend biết
    return { fileName: file.filename };
  }

}