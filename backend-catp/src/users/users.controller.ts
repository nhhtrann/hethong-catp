import { Controller, Get, Post, Body } from '@nestjs/common'; // Thêm Get vào đây
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  testServer() {
    return { message: "Server NestJS và Controller Users đã thông suốt!" };
  }

  @Post('update-profile')
  async updateProfile(@Body() updateData: { email: string; fullName: string; avatar: string }) {
    return this.usersService.updateProfile(updateData.email, updateData.fullName, updateData.avatar);
  }

  @Post('login')
  login(@Body() loginDto: any) {
    return this.usersService.login(loginDto);
  }
}