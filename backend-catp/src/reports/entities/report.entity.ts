import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tieuDe: string;

  @Column()
  mangViPham: string;

  @Column({ type: 'text', nullable: true })
  noiDung: string;

  @Column({ type: 'float', nullable: true })
  viDo: number;

  @Column({ type: 'float', nullable: true })
  kinhDo: number;

  @Column({ default: 'Mới' })
  trangThai: string;

  @Column({ nullable: true })
  ghiChuKetQua: string; // Lưu ghi chú của Công an

  @CreateDateColumn() // Tự động lấy giờ hệ thống khi insert
  ngayGui: Date;

  // THÊM DÒNG NÀY: Lưu tên đơn vị được giao nhiệm vụ
  @Column({ nullable: true })
  donViXuLy: string; 
  
  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  anhKiemChung: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  anhKetQua: string;
  
}