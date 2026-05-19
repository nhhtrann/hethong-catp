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

  @Column({ type: 'nvarchar', length: 50, nullable: true, default: 'Mới' })
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
  // Thêm các cột mới này vào bên trong export class Report { ... }

  @Column({ type: 'bit', default: 0 }) // Dùng kiểu bit cho SQL Server (0 là false, 1 là true)
  mucDoKhanCap: boolean;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  nhomVuViec: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  truongHoc: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  sdtNguoiGui: string;
  
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  diaDiem: string;
}