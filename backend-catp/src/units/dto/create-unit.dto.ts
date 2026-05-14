// src/units/dto/create-unit.dto.ts
import { IsString, IsNotEmpty, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateUnitDto {
  @IsString({ message: 'Tên đơn vị phải là chuỗi chữ!' })
  @IsNotEmpty({ message: 'Tên đơn vị không được để trống hoặc chỉ chứa khoảng trắng!' })
  @MaxLength(100, { message: 'Tên đơn vị quá dài (tối đa 100 ký tự)!' })
  tenDonVi: string;

  @IsString({ message: 'Người liên hệ phải là chuỗi chữ!' })
  @IsNotEmpty({ message: 'Người liên hệ không được để trống!' })
  nguoiLienHe: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi chữ!' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống!' })
  @Matches(/^[0-9\.\-\s]+$/, { message: 'Số điện thoại chứa ký tự không hợp lệ!' }) 
  soDienThoai: string;

  // 👉 BỔ SUNG TRƯỜNG NÀY VÀO ĐỂ NESTJS KHÔNG BÁO LỖI "SHOULD NOT EXIST" NỮA
  @IsString({ message: 'Trạng thái phải là chuỗi chữ!' })
  @IsOptional() // Cho phép không bắt buộc phải có khi thêm mới
  trangThai?: string;
}