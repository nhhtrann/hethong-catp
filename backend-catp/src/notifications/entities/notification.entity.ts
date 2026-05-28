import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // 👉 ĐÃ SỬA: Lùi ra 2 cấp thư mục (../../)

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // 👉 ĐÃ SỬA: Đổi sang nvarchar(MAX) để chống lỗi font tiếng Việt trong MSSQL
  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  // Lưu thông báo này là của Vụ việc (Report) nào để khi click vào biết đường chuyển hướng
  @Column({ nullable: true })
  reportId: number; 

  // Liên kết với người nhận thông báo
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}