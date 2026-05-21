// Thêm ManyToOne vào dòng import
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';
import { Category } from './categories.entity'; // Đảm bảo tên file đúng nhé (categories.entity.ts)

@Entity('reports')
export class Report {
@PrimaryGeneratedColumn({ name: 'reportId' })
  id: number;

  @Column()
  tieuDe: string;

  @Column({ type: 'text', nullable: true })
  noiDung: string;

  @Column({ type: 'float', nullable: true })
  viDo: number;

  @Column({ type: 'float', nullable: true })
  kinhDo: number;
  
  @Column({ type: 'nvarchar', length: 20, nullable: true })
  sdtNguoiGui: string;
  
  @Column({ type: 'nvarchar', length: 255, nullable: true })
  diaDiem: string;

  @Column({ type: 'bit', default: 0 }) 
  mucDoKhanCap: boolean;

  @Column({ type: 'nvarchar', length: 50, nullable: true, default: 'Mới' })
  trangThai: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  anhKiemChung: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  anhKetQua: string;

  @Column({ nullable: true })
  ghiChuKetQua: string; 

  @CreateDateColumn() 
  ngayGui: Date;

  @Column({ nullable: true })
  donViXuLy: string; 
  
  @ManyToOne(() => Category, (category) => category.reports, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Unit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: Unit;
}