import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  // 1. Hàm lưu dữ liệu mới vào SQL (Tương đương INSERT INTO)
  create(createReportDto: any) {
    if (!createReportDto.mangViPham) {
    createReportDto.mangViPham = createReportDto.nhomVuViec || "Chưa phân loại";
  }
    const newReport = this.reportsRepository.create(createReportDto);
    return this.reportsRepository.save(newReport);
  }

  // 2. Hàm lấy toàn bộ danh sách (Tương đương SELECT * FROM)
  async findAll() {
  const reports = await this.reportsRepository.find({ order: { id: 'DESC' } });
  
  // Xử lý để gắn đường dẫn đầy đủ vào ảnh
  return reports.map(report => ({
    ...report,
    // Giả sử anhKiemChung là một chuỗi JSON chứa danh sách ảnh: ["photo1.jpg"]
    anhKiemChung: report.anhKiemChung ? JSON.parse(report.anhKiemChung).map(
      (fileName: string) => `${process.env.API_URL || 'https://api.hethong-catp.io.vn'}/uploads/${fileName}`
    ) : []
  }));
}

  // Các hàm này tạm để trống, mình sẽ làm sau
  findOne(id: number) { return `This action returns a #${id} report`; }
  
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
