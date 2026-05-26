import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn({ name: 'newsId' })
  id: number;

  @Column({ type: 'nvarchar', length: 255 })
  tieuDe: string;

  // 👉 SỬA LỖI FONT: Dùng nvarchar('max') để hỗ trợ tiếng Việt Unicode
  @Column({ type: 'nvarchar', length: 'max' }) 
  noiDung: string;

  // Thêm cột mô tả ngắn để hiển thị card ở trang Công khai đẹp hơn
  @Column({ type: 'nvarchar', length: 500, nullable: true })
  moTaNgan: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  hinhAnh: string;

  @Column({ type: 'nvarchar', length: 100, default: 'Ban Tiếp nhận CATP' })
  tacGia: string;

  @CreateDateColumn()
  ngayDang: Date;
}