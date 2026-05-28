import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // Xóa AnyBulkWriteOperation nếu không dùng
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Category } from './entities/categories.entity';
import { Unit } from '../units/entities/unit.entity';
import { User } from '../users/entities/user.entity';

// 👉 THÊM DÒNG NÀY: Import NotificationsService
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,

    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,

    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private notificationsService: NotificationsService 
  ) {}

  async getCategories() {
    return await this.categoriesRepository.find();
  }

  async create(createReportDto: CreateReportDto, images?: any[]) {
    let phuongXaId: number | null = null;

    if (createReportDto.schoolId) {
      const school = await this.unitsRepository.findOne({
        where: { id: Number(createReportDto.schoolId) },
        relations: ['phuongXa'],
      });

      if (school && school.phuongXa) {
        phuongXaId = school.phuongXa.id;
      }
    }

    let processedImages: string[] = [];
    if (images && images.length > 0) {
      processedImages = images.map(img => img.filename ? img.filename : img);
    }

    const newReport = this.reportsRepository.create({
      ...createReportDto, 
      trangThai: createReportDto.trangThai || 'Mới',
      anhKiemChung: JSON.stringify(processedImages),
      school: createReportDto.schoolId ? { id: Number(createReportDto.schoolId) } : null,
      nguoiGui: createReportDto.nguoiGuiId ? { id: Number(createReportDto.nguoiGuiId) } : null,
      phuongXa: phuongXaId ? { id: phuongXaId } : null,
    } as any);

    const savedReport : any = await this.reportsRepository.save(newReport);

    const admins = await this.usersRepository.find({ where: { role: 'admin' } });
    
    for (const admin of admins) {
      this.notificationsService.createAndSendEmail(
        admin.id,
        admin.email,
        `Có phản ánh mới (Mã: RP-${savedReport.id})`,
        `Một phản ánh mới với tiêu đề "${savedReport.tieuDe}" vừa được gửi lên hệ thống. Vui lòng kiểm tra.`,
        savedReport.id
      );
    }
    // =========================================================================

    return savedReport;
  }

  async findAll(query: any = {}) {
    const { role, phuongXaId } = query;

    const options: any = {
      select: {
        id: true,
        tieuDe: true,
        noiDung: true,
        diaDiem: true,
        mucDoKhanCap: true,
        trangThai: true,
        sdtNguoiGui: true,
        ngayGui: true,
        donViXuLy: true,
        ghiChuKetQua: true,
      },
      relations: ['category', 'school', 'nguoiGui', 'phuongXa'], 
      order: { id: 'DESC' }
    };

    if (role === 'unit' && phuongXaId) {
      options.where = {
        phuongXa: { id: Number(phuongXaId) }
      };
    }

    return await this.reportsRepository.find(options);
  }

  async findOne(id: number) {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['category', 'school', 'nguoiGui', 'phuongXa'], 
    });

    if (!report) return null;

    let safeAnhKiemChung: any = report.anhKiemChung;
    if (safeAnhKiemChung && typeof safeAnhKiemChung === 'string') {
      try {
        safeAnhKiemChung = JSON.parse(safeAnhKiemChung);
      } catch (error) {
        safeAnhKiemChung = [safeAnhKiemChung];
      }
    }

    let safeAnhKetQua: any = report.anhKetQua;
    if (safeAnhKetQua && typeof safeAnhKetQua === 'string') {
      try {
        safeAnhKetQua = JSON.parse(safeAnhKetQua);
      } catch (error) {
        safeAnhKetQua = [safeAnhKetQua];
      }
    }
    return {
      ...report,
      anhKiemChung: safeAnhKiemChung,
      anhKetQua: safeAnhKetQua,
    };
  }

  async update(id: number, updateData: any) {
    const oldReport = await this.reportsRepository.findOne({ 
      where: { id },
      relations: ['phuongXa'] // Load kèm phường xã cũ để dễ so sánh
    });
    
    if (!oldReport) return null;

    // =========================================================================
    // XỬ LÝ 1: ADMIN PHÂN CÔNG ĐƠN VỊ XỬ LÝ
    // =========================================================================
    if (updateData.donViXuLy && oldReport.donViXuLy !== updateData.donViXuLy) {
      
      const unitInfo = await this.unitsRepository.findOne({ 
        where: { tenDonVi: updateData.donViXuLy },
        relations: ['phuongXa'] 
      });

      if (unitInfo && unitInfo.phuongXa) {
        // 👉 QUAN TRỌNG: Đồng bộ phuongXaId của Vụ việc sang Đơn vị mới
        // Để cán bộ đơn vị đó đăng nhập vào có thể thấy được báo cáo
        updateData.phuongXa = { id: unitInfo.phuongXa.id };

        // Gửi thông báo cho cán bộ
        const canBoList = await this.usersRepository.find({ 
          where: { role: 'unit', phuongXaId: unitInfo.phuongXa.id } 
        });

        for (const canBo of canBoList) {
          this.notificationsService.createAndSendEmail(
            canBo.id,
            canBo.email,
            `Nhiệm vụ mới: RP-${id}`,
            `Admin vừa giao cho đơn vị của bạn xử lý vụ việc: "${oldReport.tieuDe}".`,
            id
          );
        }
      }
    }

    // Tiến hành lưu dữ liệu (bao gồm cả phuongXaId mới nếu có) vào Database
    await this.reportsRepository.update(id, updateData);
    const updatedReport = await this.reportsRepository.findOne({ where: { id } });
    if (!updatedReport) return null;
    // =========================================================================
    // XỬ LÝ 2: ĐƠN VỊ BÁO "CHỜ DUYỆT" CHO ADMIN
    // =========================================================================
    if (updateData.trangThai === 'Chờ duyệt' && oldReport.trangThai !== 'Chờ duyệt') {
      const admins = await this.usersRepository.find({ where: { role: 'admin' } });
      
      for (const admin of admins) {
        this.notificationsService.createAndSendEmail(
          admin.id,
          admin.email,
          `Vụ việc RP-${updatedReport.id} đang chờ duyệt`,
          `Đơn vị "${updatedReport.donViXuLy}" đã xử lý xong và đổi trạng thái thành Chờ duyệt. Vui lòng kiểm tra.`,
          updatedReport.id
        );
      }
    }

    // Bổ sung thêm (Tùy chọn): Nếu Admin duyệt xong và bấm "Hoàn thành"
    if (updateData.trangThai === 'Hoàn thành' && oldReport.trangThai !== 'Hoàn thành') {
        // Ở đây bạn có thể viết logic gửi mail cho Người Dân (nếu họ có để lại email) 
        // để báo cáo là vụ việc của họ đã được giải quyết.
    }

    return updatedReport;
  }

  async getStats() {
    const total = await this.reportsRepository.count();
    const processed = await this.reportsRepository.count({ where: { trangThai: 'Hoàn thành' } });
    const pending = await this.reportsRepository.count({ where: { trangThai: 'Đang xử lý' } });
    const news = await this.reportsRepository.count({ where: { trangThai: 'Mới' } });

    const chartRawData = await this.reportsRepository
      .createQueryBuilder('report')
      .select('report.mangViPham', 'mang')
      .addSelect('COUNT(report.id)', 'tongSo')
      .addSelect("SUM(CASE WHEN report.trangThai = 'Hoàn thành' THEN 1 ELSE 0 END)", 'daXuLy')
      .groupBy('report.mangViPham')
      .getRawMany();

    const colorMap = {
      'Giao thông': '#3b82f6',
      'Bạo lực': '#ef4444',
      'An ninh Trật tự': '#10b981',
      'Lừa đảo': '#f59e0b',
      'Ma túy': '#8b5cf6'
    };

    const chartData = chartRawData.map(item => ({
      mang: item.mang,
      tongSo: Number(item.tongSo),
      daXuLy: Number(item.daXuLy),
      mauSac: colorMap[item.mang] || '#6b7280'
    }));

    return {
      stats: { total, processed, pending, news },
      chartData
    };
  }

  async remove(id: number) {
    const result = await this.reportsRepository.delete(id);
    
    if (result.affected === 0) {
      return { success: false, message: 'Không tìm thấy vụ việc này trong Database!' };
    }
    
    return { success: true, message: 'Đã xóa hoàn toàn khỏi SQL Server!' };
  }
}