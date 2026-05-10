import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Để dùng được Repository trong Service
  controllers: [UsersController], // Kích hoạt Controller
  providers: [UsersService], // Kích hoạt Service
  exports: [UsersService],
})
export class UsersModule {}