// src/news/dto/create-news.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNewsDto {
  @IsString({ message: 'Tiêu đề phải là chuỗi chữ!' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống hoặc chứa toàn khoảng trắng!' })
  tieuDe: string;

  @IsString({ message: 'Nội dung phải là chuỗi chữ!' })
  @IsNotEmpty({ message: 'Nội dung không được để trống!' })
  noiDung: string;

  // Các trường dưới đây có thể không được gửi lên (hoặc gửi rỗng) nên dùng @IsOptional
  @IsString()
  @IsOptional()
  tacGia?: string;

  @IsString()
  @IsOptional()
  hinhAnh?: string;

  @IsString()
  @IsOptional()
  ngayDang?: string;
}