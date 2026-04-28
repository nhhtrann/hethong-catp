import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
  ) {}

  // Hàm lưu Đơn vị mới vào SQL
  create(createUnitDto: any) {
    const newUnit = this.unitsRepository.create(createUnitDto);
    return this.unitsRepository.save(newUnit);
  }

  // Hàm lấy toàn bộ danh sách Đơn vị
  findAll() {
    return this.unitsRepository.find();
  }

  
}