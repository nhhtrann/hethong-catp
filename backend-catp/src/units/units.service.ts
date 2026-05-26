import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { PhuongXa } from './entities/phuong-xa.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    @InjectRepository(PhuongXa)
    private phuongXaRepository: Repository<PhuongXa>
  ) {}

  // 1. THÊM MỚI (Có kiểm tra trùng tên)
  async create(createUnitDto: any) {
    // Tìm xem trong DB đã có tên này chưa
    const existingUnit = await this.unitsRepository.findOne({ 
      where: { tenDonVi: createUnitDto.tenDonVi } 
    });

    if (existingUnit) {
      // Nếu có rồi thì ném lỗi 400 về cho React
      throw new BadRequestException('Tên đơn vị này đã tồn tại trong hệ thống!');
    }

    const newUnit = this.unitsRepository.create(createUnitDto);
    return this.unitsRepository.save(newUnit);
  }

  // 2. LẤY DANH SÁCH
  async findAll() {
    return await this.unitsRepository.find({
      // 👉 THÊM DÒNG NÀY: Bảo TypeORM tự động JOIN sang bảng phuong_xa
      relations: ['phuongXa'], 
      order: { id: 'DESC' }
    });
  }

  // 3. SỬA ĐƠN VỊ
  async update(id: number, updateData: any) {
    await this.unitsRepository.update(id, updateData);
    return this.unitsRepository.findOne({ where: { id } });
  }

  // 4. XÓA ĐƠN VỊ
  async remove(id: number) {
    return this.unitsRepository.delete(id);
  }
  async getAllPhuongXa() {
    return await this.phuongXaRepository.find();
  }
}