import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './entities/report.entity'; // Import bảng
import { Category } from './entities/categories.entity'; // Import bảng Category
@Module({
  // Thêm dòng imports này vào để kết nối Module với Entity
  imports: [TypeOrmModule.forFeature([Report, Category])], 
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}