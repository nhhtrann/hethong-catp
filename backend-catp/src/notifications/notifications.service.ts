import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationsGateway } from './notifications.gateway';
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
    private mailerService: MailerService,
  ) {}

  // 👉 HÀM TẠO THÔNG BÁO VÀ GỬI EMAIL
  async createAndSendEmail(
    userId: number, 
    userEmail: string, 
    title: string, 
    content: string, 
    reportId?: number
  ) {
    // 1. Lưu thông báo vào Database (để hiển thị ở Quả chuông trên Web)
    const newNotif = this.notificationRepo.create({
      userId,
      title,
      content,
      reportId,
    });
    await this.notificationRepo.save(newNotif);

    this.notificationsGateway.sendNotificationToUser(userId, newNotif);
    // ==========================================================

    // 3. Gửi Email (Chạy ngầm)
    if (userEmail) {
      this.mailerService.sendMail({
        to: userEmail,
        subject: `[Hệ thống An Ninh Học Đường] ${title}`,
        text: content,
      }).catch(err => console.error('Lỗi gửi email:', err));
    }

    return newNotif;
  }

  // 👉 HÀM LẤY DANH SÁCH THÔNG BÁO CHO QUẢ CHUÔNG (Lấy 20 tin mới nhất)
  async getNotificationsByUser(userId: number) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  // 👉 HÀM ĐÁNH DẤU ĐÃ ĐỌC
  async markAsRead(notifId: number) {
    await this.notificationRepo.update(notifId, { isRead: true });
    return { success: true };
  }
}