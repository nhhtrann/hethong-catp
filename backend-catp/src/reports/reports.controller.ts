import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('stats') 
  findAllStats() {
    return this.reportsService.getStats();
  } 

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: any) {
    // Chuyển id từ chuỗi (string) sang số (number) và gọi hàm service
    return this.reportsService.update(+id, updateReportDto);
  }

 // Trong file src/reports/reports.controller.ts
  @Delete(':id')
  remove(@Param('id') id: string) {
    // Dấu + ở trước id là để ép kiểu chuỗi thành số (number)
    return this.reportsService.remove(+id); 
  }

}