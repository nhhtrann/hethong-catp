import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Report } from '../../reports/entities/report.entity'; // Bạn nhớ check lại đường dẫn import nhé

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn({ name: 'userId' })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Tạm thời để plain text test cho lẹ, sau này ốp Bcrypt vào sau.

  @Column({ nullable: true })
  fullName: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  avatar: string;

  // 👉 NÂNG CẤP ROLE: Gồm 'admin', 'unit' (Phường/Công an), 'truonghoc', và 'nguoidan'
  @Column({ default: 'nguoidan' })
  role: string; 

  @Column({ nullable: true })
  unitId: number; 

  //Dành riêng cho tài khoản Công an Phường
  @Column({ nullable: true })
  phuongXaId: number;

  // 👉 HỆ THỐNG ĐIỂM UY TÍN: Khởi tạo 100 điểm cho user mới
  @Column({ type: 'int', default: 100 })
  diemUyTin: number;

  @Column({ type: 'bit', default: 1 }) // Dùng kiểu bit chuẩn SQL Server
  isActive: boolean;

  // 👉 KHÓA NGOẠI: Nối sang bảng Report (1 người dân gửi nhiều vụ việc)
  @OneToMany(() => Report, (report) => report.nguoiGui)
  reports: Report[];
}