import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
  ) {}

  // 1. Hàm lưu dữ liệu mới vào SQL (Tương đương INSERT INTO)
  create(createReportDto: any) {
    const newReport = this.reportsRepository.create(createReportDto);
    return this.reportsRepository.save(newReport);
  }

  // 2. Hàm lấy toàn bộ danh sách (Tương đương SELECT * FROM)
  findAll() {
    return this.reportsRepository.find();
  }

  // Các hàm này tạm để trống, mình sẽ làm sau
  findOne(id: number) { return `This action returns a #${id} report`; }
  remove(id: number) { return `This action removes a #${id} report`; }
  // Cập nhật dữ liệu dựa theo ID
  async update(id: number, updateData: any) {
    await this.reportsRepository.update(id, updateData);
    // Trả về dữ liệu sau khi đã cập nhật xong
    return this.reportsRepository.findOne({ where: { id } });
  }
}