import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './entities/report.entity'; // Import bảng
import { Category } from './entities/categories.entity'; // Import bảng Category
import { Unit } from '../units/entities/unit.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';
@Module({
  // Thêm dòng imports này vào để kết nối Module với Entity
  imports: [TypeOrmModule.forFeature([Report, Category, Unit, User]), 
    NotificationsModule], 
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}