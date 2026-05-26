import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  async login(loginDto: any) {
    const { email, password } = loginDto;

    // 1. Tìm user theo email
    const user = await this.userRepository.findOne({ where: { email } });

    // 2. Kiểm tra xem user có tồn tại và mật khẩu có khớp không
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
    }

    // 3. Kiểm tra xem tài khoản có bị khóa không
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản này đã bị khóa!');
    }

    // 4. Bóc tách mật khẩu ra, không trả về mật khẩu cho Frontend để bảo mật
    const { password: _, ...userInfo } = user;
    
    // Trả về thông tin user (để Frontend biết là admin, unit hay người dân)
    return {
      message: 'Đăng nhập thành công',
      user: userInfo
    };
  }
}