import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Users') // Tên bảng trong SQL Server
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Tạm thời để string thường để test, sau này đi làm thực tế sẽ dùng Bcrypt mã hóa sau.

  @Column({ default: 'unit' })
  role: string; // Phân quyền: 'admin' hoặc 'unit'

  // Ví dụ trong file user.entity.ts
  @Column({ nullable: true })
  fullName: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  avatar: string;
}