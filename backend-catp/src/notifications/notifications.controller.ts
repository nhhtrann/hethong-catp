import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // API lấy danh sách thông báo của 1 user
  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: number) {
    return this.notificationsService.getNotificationsByUser(userId);
  }

  // API đánh dấu đã đọc
  @Patch(':id/read')
  async markAsRead(@Param('id') id: number) {
    return this.notificationsService.markAsRead(id);
  }
}