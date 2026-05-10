import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateProfile(email: string, fullName: string, avatar: string) {
    try {
      // 1. Tìm user trong DB bằng email
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        return { success: false, message: 'Không tìm thấy tài khoản này trong hệ thống!' };
      }

      // 2. Gán giá trị mới (Lưu ý: Phải khớp với tên cột trong user.entity.ts)
      user.fullName = fullName;
      user.avatar = avatar;

      // 3. Lưu lại vào SQL
      await this.userRepository.save(user);

      return { 
        success: true, 
        message: 'Cập nhật hồ sơ thành công!',
        data: { fullName: user.fullName, avatar: user.avatar } 
      };
    } catch (error) {
      console.error('Lỗi Update Profile:', error);
      return { success: false, message: 'Lỗi máy chủ: ' + error.message };
    }
  }
}