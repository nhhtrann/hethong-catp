import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway], // 👉 THÊM VÀO ĐÂY
  exports: [NotificationsService, NotificationsGateway],   // 👉 EXPORT RA ĐỂ LÁT NỮA REPORT SERVICE GỌI KÉ
})
export class NotificationsModule {}