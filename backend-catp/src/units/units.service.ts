import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
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
  findAll() {
    return this.unitsRepository.find();
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
}