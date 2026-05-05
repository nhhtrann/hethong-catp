import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('news') // Tên bảng trong SQL Server sẽ là 'new'
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tieuDe: string;

  @Column('text') // Dùng 'text' vì nội dung bài viết thường rất dài
  noiDung: string;

  @Column({ nullable: true })
  hinhAnh: string;

  @Column({ default: 'Ban Tiếp nhận CATP' })
  tacGia: string;

  @CreateDateColumn() // Tự động lấy giờ hệ thống lúc đăng bài
  ngayDang: Date;
}