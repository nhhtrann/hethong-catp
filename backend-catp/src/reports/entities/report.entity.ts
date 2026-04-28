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

  @Column({ nullable: true })
  toaDoGps: string;

  @Column({ default: 'Mới' })
  trangThai: string;

  @CreateDateColumn() // Tự động lấy giờ hệ thống khi insert
  ngayGui: Date;
}