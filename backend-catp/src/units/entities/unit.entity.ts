import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PhuongXa } from './phuong-xa.entity';

@Entity('units') // Tên bảng trong SQL Server
export class Unit {
  @PrimaryGeneratedColumn({ name: 'unitId' })
  id: number;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  tenDonVi: string;

  @Column({ length: 100, nullable: true })
  nguoiLienHe: string;

  @Column({ length: 20, nullable: true })
  soDienThoai: string;

  @Column({ default: 'Hoạt động' })
  trangThai: string;

  @ManyToOne(() => PhuongXa, { nullable: true })
  @JoinColumn({ name: 'phuongXaId' })
  phuongXa: PhuongXa;
}