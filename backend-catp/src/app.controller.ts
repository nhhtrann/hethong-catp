import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // TẠO API NHẬN YÊU CẦU QUÊN MẬT KHẨU
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.appService.sendOtpEmail(email);
  }
  
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; otp: string; newPass: string }
  ) {
    return await this.appService.resetPassword(body.email, body.otp, body.newPass);
  }

  // Thêm API này vào dưới cùng của AppController
  @Post('login')
  async login(@Body() body: { email: string; pass: string }) {
    return await this.appService.loginReal(body.email, body.pass);
  }
  // Mở API Đổi mật khẩu (dành cho user đã đăng nhập)
  @Post('change-password')
  async changePassword(@Body() body: { email: string; oldPass: string; newPass: string }) {
    return await this.appService.changePassword(body.email, body.oldPass, body.newPass);
  }
}