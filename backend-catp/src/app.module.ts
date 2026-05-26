import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from './reports/reports.module';
import { UnitsModule } from './units/units.module';
import { UsersModule } from './users/users.module';
import { Report } from './reports/entities/report.entity';
import { Unit } from './units/entities/unit.entity';
import { News } from './news/entities/news.entity';
import { User } from './users/entities/user.entity';

import { NewsModule } from './news/news.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadController } from './upload.controller';
import { Category } from './reports/entities/categories.entity';
import { PhuongXa } from './units/entities/phuong-xa.entity';

@Module({
  imports: [
    // 1. KÍCH HOẠT ĐỌC FILE .ENV
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    
    // 2. DÙNG forRootAsync ĐỂ ÉP HỆ THỐNG ĐỢI ĐỌC XONG .ENV MỚI KẾT NỐI
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService], 
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') || '1433', 10),
        username: configService.get<string>('DB_USER') || 'sa',
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME') || 'hethong-catp',
        
        entities: [Report, Unit, News, User, Category, PhuongXa],
        
        synchronize: true, // Tự động tạo bảng theo Entity (Chỉ dùng trong dev, không dùng trong production)
        extra: {
          trustServerCertificate: false,
          encrypt: false,
          requestTimeout: 30000, 
          connectionTimeout: 30000,
          options: {
            cryptoCredentialsDetails: {
              minVersion: 'TLSv1',
            },
          },
        },
      }),
    }),
    TypeOrmModule.forFeature([User, Category, PhuongXa]),
    ReportsModule,
    UnitsModule,
    NewsModule,
    UsersModule,
    
  ],
  controllers: [AppController, UploadController], 
  providers: [AppService],
})
export class AppModule {}