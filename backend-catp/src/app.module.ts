import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from './reports/reports.module';
import { UnitsModule } from './units/units.module';
import { Report } from './reports/entities/report.entity';
import { Unit } from './units/entities/unit.entity';
import { News } from './news/entities/news.entity';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    // Cấu hình kết nối SQL Server
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433, // Cổng mặc định của SQL Server
      username: 'sa', // ĐỔI THÀNH USERNAME SQL CỦA BẠN
      password: 'sa', // ĐỔI THÀNH PASSWORD SQL CỦA BẠN
      database: 'hethong-catp',
      entities: [Report, Unit, News],
      synchronize: true, // PHÉP THUẬT LÀ ĐÂY: Tự động tạo bảng dựa trên Entity
      options: {
        encrypt: false, // Dùng cho local SQL Server
        trustServerCertificate: true,
      },
    }),
    ReportsModule,
    UnitsModule,
    NewsModule,
  ],
})
export class AppModule {}