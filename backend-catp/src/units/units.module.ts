import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit } from './entities/unit.entity'; // Import bảng Unit

@Module({
  // Thêm dòng này để kết nối
  imports: [TypeOrmModule.forFeature([Unit])], 
  controllers: [UnitsController],
  providers: [UnitsService],
})
export class UnitsModule {}