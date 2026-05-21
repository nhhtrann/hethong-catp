import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Report } from './report.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ name: 'categoryId' })
  id: number;

  @Column({ type: 'nvarchar', length: 100, unique: true })
  tenDanhMuc: string;

  // Quan hệ 1 mảng vi phạm có thể có NHIỀU báo cáo phản ánh
  @OneToMany(() => Report, (report) => report.category)
  reports: Report[];
}