import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsModule } from './reports/reports.module';
import { UnitsModule } from './units/units.module';
import { Report } from './reports/entities/report.entity';
import { Unit } from './units/entities/unit.entity';
import { News } from './news/entities/news.entity';
import { User } from './users/entities/user.entity';

import { NewsModule } from './news/news.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
        host: configService.get<string>('DB_HOST'),
        // 👉 ĐÃ SỬA: Ép kiểu chữ thành số một cách an toàn
        port: parseInt(configService.get<string>('DB_PORT') || '1433', 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        
        // 👉 ĐÃ SỬA: Đưa các Entity vào đúng vị trí
        entities: [Report, Unit, News, User],
        
        synchronize: true,
        extra: {
          trustServerCertificate: true,
          encrypt: false,
          // Bọc nó vào trong một object 'options' nữa
          options: {
            cryptoCredentialsDetails: {
              minVersion: 'TLSv1',
            },
          },
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
    ReportsModule,
    UnitsModule,
    NewsModule,TypeOrmModule.forFeature([User]),
    
  ],
  controllers: [AppController], 
  providers: [AppService],
})
export class AppModule {}