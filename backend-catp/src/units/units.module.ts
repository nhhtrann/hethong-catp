import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit } from './entities/unit.entity'; // Import bảng Unit
import { PhuongXa } from './entities/phuong-xa.entity';

@Module({
  // Thêm dòng này để kết nối
  imports: [TypeOrmModule.forFeature([Unit, PhuongXa])], // Đảm bảo bạn đã import PhuongXa nếu có quan hệ
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}