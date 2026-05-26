import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('phuong_xa')
export class PhuongXa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 100 })
  tenPhuongXa: string;

  
}