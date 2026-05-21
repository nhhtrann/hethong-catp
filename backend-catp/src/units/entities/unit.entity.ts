import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('units') // Tên bảng trong SQL Server
export class Unit {
  @PrimaryGeneratedColumn({ name: 'unitId' })
  id: number;

  @Column({ length: 255 })
  tenDonVi: string;

  @Column({ length: 100, nullable: true })
  nguoiLienHe: string;

  @Column({ length: 20, nullable: true })
  soDienThoai: string;

  @Column({ default: 'Hoạt động' })
  trangThai: string;
}