import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnyBulkWriteOperation, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Category } from './entities/categories.entity';
import path from 'path';
import fs from 'fs';
import { Unit } from '../units/entities/unit.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,

    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,

    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>
  ) {}

  
  async getCategories() {
    return await this.categoriesRepository.find();
  }

  async create(createReportDto: CreateReportDto, images?: any[]) {
    let phuongXaId: number | null = null;

    if (createReportDto.schoolId) {
      const school = await this.unitsRepository.findOne({
        where: { id: Number(createReportDto.schoolId) },
        relations: ['phuongXa'],
      });

      if (school && school.phuongXa) {
        phuongXaId = school.phuongXa.id;
      }
    }

    const newReport = this.reportsRepository.create({
      ...createReportDto, // Kế thừa toàn bộ thuộc tính chuẩn từ DTO
      trangThai: createReportDto.trangThai || 'Mới',
      images: images || [],
      school: createReportDto.schoolId ? { id: Number(createReportDto.schoolId) } : null,
      nguoiGui: createReportDto.nguoiGuiId ? { id: Number(createReportDto.nguoiGuiId) } : null,
      phuongXa: phuongXaId ? { id: phuongXaId } : null,
    } as any);

    return await this.reportsRepository.save(newReport);
  }

  // 2. Hàm lấy toàn bộ danh sách (Tương đương SELECT * FROM)
  async findAll(query: any = {}) {
    const { role, phuongXaId } = query;

    const options: any = {
      // 👉 CHÌA KHÓA LÀ ĐÂY: Liệt kê các cột muốn lấy, chừa 2 cột ảnh ra!
      select: {
        id: true,
        tieuDe: true,
        noiDung: true,
        diaDiem: true,
        mucDoKhanCap: true,
        trangThai: true,
        sdtNguoiGui: true,
        ngayGui: true,
        donViXuLy: true,
        ghiChuKetQua: true,
        // TUYỆT ĐỐI KHÔNG ghi anhKiemChung và anhKetQua vào đây
      },
      relations: ['category', 'school', 'nguoiGui', 'phuongXa'], 
      order: { id: 'DESC' }
    };

    if (role === 'unit' && phuongXaId) {
      options.where = {
        phuongXa: { id: Number(phuongXaId) }
      };
    }

    // Lúc này Database trả về rất nhẹ, mảng reports không hề chứa chuỗi ảnh
    const reports = await this.reportsRepository.find(options);

    // Bạn có thể return reports luôn, không cần map() để JSON.parse ảnh ở đây nữa
    return reports; 
  }

  // Các hàm này tạm để trống, mình sẽ làm sau
  async findOne(id: number) {
    // 1. Chỉ tìm đúng 1 bản ghi theo ID
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['category', 'school', 'nguoiGui', 'phuongXa'], 
    });

    if (!report) return null;

    // 2. Xử lý an toàn cho ảnh kiểm chứng (Giống hệt logic cũ của bạn)
    let safeAnhKiemChung: any = report.anhKiemChung;
    if (safeAnhKiemChung && typeof safeAnhKiemChung === 'string') {
      try {
        safeAnhKiemChung = JSON.parse(safeAnhKiemChung);
      } catch (error) {
        safeAnhKiemChung = [safeAnhKiemChung];
      }
    }

    // 3. Xử lý an toàn cho ảnh kết quả
    let safeAnhKetQua: any = report.anhKetQua;
    if (safeAnhKetQua && typeof safeAnhKetQua === 'string') {
      try {
        safeAnhKetQua = JSON.parse(safeAnhKetQua);
      } catch (error) {
        safeAnhKetQua = [safeAnhKetQua];
      }
    }

    // 4. Trả về đúng 1 Object hoàn chỉnh chứa hình ảnh
    return {
      ...report,
      anhKiemChung: safeAnhKiemChung,
      anhKetQua: safeAnhKetQua,
    };
  }
  
  // Cập nhật dữ liệu dựa theo ID
  async update(id: number, updateData: any) {
    await this.reportsRepository.update(id, updateData);
    // Trả về dữ liệu sau khi đã cập nhật xong
    return this.reportsRepository.findOne({ where: { id } });
  }
  // src/reports/reports.service.ts

async getStats() {
  // 1. Đếm các con số tổng quát
  const total = await this.reportsRepository.count();
  const processed = await this.reportsRepository.count({ where: { trangThai: 'Hoàn thành' } });
  const pending = await this.reportsRepository.count({ where: { trangThai: 'Đang xử lý' } });
  const news = await this.reportsRepository.count({ where: { trangThai: 'Mới' } });

  // 2. Gom nhóm dữ liệu cho Biểu đồ (Group by Mảng vi phạm)
  const chartRawData = await this.reportsRepository
    .createQueryBuilder('report')
    .select('report.mangViPham', 'mang')
    .addSelect('COUNT(report.id)', 'tongSo')
    .addSelect("SUM(CASE WHEN report.trangThai = 'Hoàn thành' THEN 1 ELSE 0 END)", 'daXuLy')
    .groupBy('report.mangViPham')
    .getRawMany();

  // 3. Gán màu sắc cho từng mảng để biểu đồ đẹp hơn
  const colorMap = {
    'Giao thông': '#3b82f6',
    'Bạo lực': '#ef4444',
    'An ninh Trật tự': '#10b981',
    'Lừa đảo': '#f59e0b',
    'Ma túy': '#8b5cf6'
  };

  const chartData = chartRawData.map(item => ({
    mang: item.mang,
    tongSo: Number(item.tongSo),
    daXuLy: Number(item.daXuLy),
    mauSac: colorMap[item.mang] || '#6b7280'
  }));

  return {
    stats: { total, processed, pending, news },
    chartData
  };
}
// Trong file src/reports/reports.service.ts
  async remove(id: number) {
    // Gọi lệnh delete của TypeORM để chém bay dòng dữ liệu trong SQL Server
    const result = await this.reportsRepository.delete(id);
    
    if (result.affected === 0) {
      return { success: false, message: 'Không tìm thấy vụ việc này trong Database!' };
    }
    
    return { success: true, message: 'Đã xóa hoàn toàn khỏi SQL Server!' };
  }

}
