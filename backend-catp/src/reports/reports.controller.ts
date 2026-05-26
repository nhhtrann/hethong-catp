import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express'; // Import cái này
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Body() createReportDto: CreateReportDto, 
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    // Ép kiểu sang any để TypeScript "nhắm mắt làm ngơ" với các thay đổi cấu trúc
    const data = {
      ...createReportDto,
      categoryId: createReportDto.categoryId ? Number(createReportDto.categoryId) : undefined,
      schoolId: createReportDto.schoolId ? Number(createReportDto.schoolId) : undefined,
      nguoiGuiId: createReportDto.nguoiGuiId ? Number(createReportDto.nguoiGuiId) : undefined,
      mucDoKhanCap: String(createReportDto.mucDoKhanCap) === 'true', 
    } as CreateReportDto; // Ép kiểu về DTO đúng chuẩn

    return this.reportsService.create(data, files);
  }
  
  @Get()
  findAll(@Query() query: any) { 
    return this.reportsService.findAll(query);
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
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    // Chuyển id từ chuỗi (string) sang số (number) và gọi hàm service
    return this.reportsService.update(+id, updateReportDto);
  }

 // Trong file src/reports/reports.controller.ts
  @Delete(':id')
  remove(@Param('id') id: string) {
    // Dấu + ở trước id là để ép kiểu chuỗi thành số (number)
    return this.reportsService.remove(+id); 
  }

  @Get('categories/list')
  getCategories() {
    return this.reportsService.getCategories();
  }

}