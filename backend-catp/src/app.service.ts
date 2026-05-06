import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm'; // Bổ sung
import { Repository } from 'typeorm'; // Bổ sung
import { User } from './users/entities/user.entity'; // Bổ sung

@Injectable()
export class AppService {
  private transporter;
  private otpStorage = new Map<string, string>();

  constructor(
    private configService: ConfigService,
    // 👉 TIÊM REPOSITORY CỦA BẢNG USER VÀO ĐÂY
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  // 👉 HÀM 1: KIỂM TRA ĐĂNG NHẬP
  async loginReal(email: string, pass: string) {
    // Tìm user trong Database có email khớp
    const user = await this.userRepository.findOne({ where: { email } });
    
    // Nếu không tìm thấy hoặc sai mật khẩu
    if (!user || user.password !== pass) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác!' };
    }

    // Nếu thành công, trả về thông tin user
    return { success: true, email: user.email, role: user.role };
  }

  // ... (Hàm sendOtpEmail của bạn giữ nguyên không đổi) ...
  
async sendOtpEmail(emailTo: string) {
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // LƯU MÃ OTP VÀO BỘ NHỚ TẠM
      this.otpStorage.set(emailTo, otpCode);

      const mailOptions = {
        from: '"Hệ thống CATP" <no-reply@catp.vn>',
        to: emailTo,
        subject: '🔒 Mã xác thực khôi phục mật khẩu',
        html: `<div style="font-family: sans-serif; padding: 20px;">
                <h2>Mã OTP của bạn là: <span style="color:red">${otpCode}</span></h2>
                <p>Mã này dùng để đặt lại mật khẩu hệ thống CATP.</p>
              </div>`,
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Đã gửi mã OTP!' };
    } catch (error) {
      return { success: false, message: 'Lỗi gửi email!' };
    }
  }
  // 👉 HÀM 2: NÂNG CẤP HÀM ĐỔI MẬT KHẨU (LƯU VÀO DB)
  async resetPassword(email: string, otp: string, newPass: string) {
  
    const savedOtp = this.otpStorage.get(email);

    if (!savedOtp || savedOtp !== otp) {
      return { success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn!' };
    }

    // Kiểm tra xem email này có tồn tại trong Database không
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return { success: false, message: 'Tài khoản không tồn tại trong hệ thống!' };
    }

    // 👉 LƯU MẬT KHẨU MỚI VÀO CƠ SỞ DỮ LIỆU
    user.password = newPass;
    await this.userRepository.save(user); // Cập nhật xuống SQL Server
    
    this.otpStorage.delete(email); // Xóa OTP sau khi dùng xong
    
    return { success: true, message: 'Đặt lại mật khẩu thành công!' };
  }
}

