// src/reports/dto/create-report.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReportDto {
  @IsString({ message: 'Tiêu đề phải là chuỗi chữ!' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống!' })
  tieuDe: string;

  @IsString({ message: 'Mảng vi phạm phải là chuỗi chữ!' })
  @IsOptional() 
  mangViPham?: string;

  @IsString({ message: 'Nội dung phải là chuỗi chữ!' })
  @IsNotEmpty({ message: 'Nội dung không được để trống!' })
  noiDung: string;

  // --- Các trường không bắt buộc (Có thể Frontend không gửi lên khi thêm mới) ---
  @IsString()
  @IsOptional()
  nguoiPhanAnh?: string;

  @IsString()
  @IsOptional()
  soDienThoai?: string;

  @IsString()
  @IsOptional()
  anhKiemChung?: string;

  @IsString()
  @IsOptional()
  trangThai?: string;

  @IsString()
  @IsOptional()
  ngayGui?: string;

  // --- Các trường dành riêng cho Đơn vị xử lý (Lúc tạo mới sẽ trống) ---
  @IsString()
  @IsOptional()
  donViXuLy?: string;

  @IsString()
  @IsOptional()
  ghiChuKetQua?: string;

  @IsString()
  @IsOptional()
  anhKetQua?: string;

  @IsString()
  @IsOptional()
  kinhDo?: string;

  @IsString()
  @IsOptional()
  viDo?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true) // Ép kiểu string 'true' -> boolean true
  mucDoKhanCap?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value)) // Ép kiểu string '1' -> number 1
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value)) // Ép kiểu string '30' -> number 30
  schoolId?: number;

  @IsOptional()
  @IsString()
  sdtNguoiGui?: string;

  @IsString()
  @IsOptional()
  diaDiem?: string;
  
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value)) // Thêm dòng này vào
  nguoiGuiId?: number;
}