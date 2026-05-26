// src/pages/ResultReport.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Input, Space, Button, Select } from 'antd';
import { SearchOutlined, DownloadOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

// IMPORT COMPONENT MODAL DÙNG CHUNG
import ReportDetail from '../pages/ReportDetail'; 

const { Title } = Typography;
const { Option } = Select;

const ResultReport = () => {
  const [data, setData] = useState([]);
  const [units, setUnits] = useState([]); 
  
  const [searchText, setSearchText] = useState('');
  const [filterMang, setFilterMang] = useState('Tất cả');
  const [filterTrangThai, setFilterTrangThai] = useState('Tất cả');
  const [filterDonVi, setFilterDonVi] = useState('Tất cả'); 

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // 👉 BỔ SUNG: Biến theo dõi màn hình điện thoại để xử lý phân trang và ghim cột
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 👉 1. Lấy thông tin tài khoản đang đăng nhập từ localStorage
    const userInfo = JSON.parse(localStorage.getItem('catp_user')) || {};
    const { role = '', phuongXaId = '' } = userInfo;

    // 👉 2. Kẹp thêm role và phuongXaId vào đuôi của link API
    fetch(`${import.meta.env.VITE_API_URL}/reports?role=${role}&phuongXaId=${phuongXaId}`)
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result)) {
          const reversedResult = [...result].reverse();
          const formattedData = reversedResult.map((item, index) => ({
            id: item.id,
            key: item.id?.toString(),
            stt: index + 1,
            tieuDe: item.tieuDe,
            mang: item.mangViPham,
            donViXuLy: item.donViXuLy || 'Chưa phân công',
            trangThai: item.trangThai,
            noiDung: item.noiDung,
            ghiChu: item.ghiChuKetQua,
            anhKetQua: item.anhKetQua,
            anhKiemChung : item.anhKiemChung, 
            ngayGui: item.ngayGui ? new Date(item.ngayGui).toLocaleDateString('vi-VN') : '',
          }));
          setData(formattedData);
        }
      })
      .catch(error => console.error('Lỗi API Reports:', error));

    // API lấy danh sách Units giữ nguyên
    fetch(`${import.meta.env.VITE_API_URL}/units`)
      .then(res => res.json())
      .then(result => Array.isArray(result) && setUnits(result))
      .catch(err => console.error('Lỗi API Units:', err));
  }, []);

  const filteredData = data.filter(item => {
    const matchSearch = item.tieuDe?.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.donViXuLy?.toLowerCase().includes(searchText.toLowerCase());
    const matchMang = filterMang === 'Tất cả' || item.mang === filterMang;
    const matchTrangThai = filterTrangThai === 'Tất cả' || item.trangThai === filterTrangThai;
    const matchDonVi = filterDonVi === 'Tất cả' || item.donViXuLy === filterDonVi;
return matchSearch && matchMang && matchTrangThai && matchDonVi;
  });

  const handleExport = () => {
    const headers = ['STT', 'Tiêu đề', 'Mảng vi phạm', 'Đơn vị xử lý', 'Trạng thái', 'Ngày gửi'];
    const rows = filteredData.map(item => [
      item.stt, `"${item.tieuDe}"`, `"${item.mang}"`, `"${item.donViXuLy}"`, `"${item.trangThai}"`, `"${item.ngayGui}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "NhiemVu_DonVi.csv";
    link.click();
  };

  // 👉 ĐÃ SỬA: Căn giữa tất cả các cột, bóp nhỏ cột hành động
  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' },
    { title: 'Tiêu đề vụ việc', dataIndex: 'tieuDe', key: 'tieuDe', width: 250, ellipsis: true, align: 'center' },
    { title: 'Đơn vị thực hiện', dataIndex: 'donViXuLy', key: 'donViXuLy', width: 200, align: 'center' },
    { title: 'Thời gian', dataIndex: 'ngayGui', key: 'ngayGui', width: 120, align: 'center' },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      width: 140,
      align: 'center',
      render: (trangThai) => {
        let color = trangThai === 'Hoàn thành' ? 'green' : (trangThai === 'Đang xử lý' ? 'gold' : 'blue');
        return <Tag color={color}>{trangThai?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right', // Hủy ghim trên điện thoại
      width: 80, // Thu nhỏ độ rộng
      align: 'center',
      render: (_, record) => {
        const isDone = record.trangThai === 'Hoàn thành';
        const IconComponent = isDone ? EyeOutlined : EditOutlined;
        const iconColor = isDone ? '#8c8c8c' : '#1890ff'; 

        return (
          <Button 
            type="text" 
            size="small" // Nút bé gọn lại
            icon={<IconComponent style={{ color: iconColor, fontSize: '18px' }} />} 
            onClick={() => {
              setSelectedRecord(record);
              setIsModalVisible(true);
            }}
            title={isDone ? 'Xem lại' : 'Báo cáo kết quả'}
          />
        );
      },
    },
  ];

  return (
    // 👉 ĐÃ SỬA: Padding bóp lại trên điện thoại để không bị chật
    <div style={{ padding: 'clamp(10px, 2vw, 24px)', overflowX: 'hidden' }}>
      
      {/* Căn giữa tiêu đề trang trên mọi thiết bị */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', textAlign: 'center' }}>
          Nhiệm vụ & Báo cáo kết quả
        </Title>
      </div>
<Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {/* 👉 ĐÃ SỬA: Toolbar tự động rớt dòng trên điện thoại */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 20, 
          gap: '16px' 
        }}>
          <Space wrap style={{ flex: 1, width: '100%' }}>
            <Input 
              placeholder="Tìm theo tiêu đề..." 
              prefix={<SearchOutlined />} 
              style={{ width: '100%', minWidth: '200px', maxWidth: '280px' }} 
              onChange={(e) => setSearchText(e.target.value)}
            />
            
            <Select defaultValue="Tất cả" style={{ width: '100%', minWidth: '130px', maxWidth: '160px' }} onChange={setFilterMang}>
              <Option value="Tất cả">Tất cả mảng</Option>
              <Option value="Giao thông">Giao thông</Option>
              <Option value="Bạo lực">Bạo lực</Option>
              <Option value="Ma túy">Ma túy</Option>
              <Option value="An ninh Trật tự">An ninh Trật tự</Option>
            </Select>

            <Select defaultValue="Tất cả" style={{ width: '100%', minWidth: '150px', maxWidth: '180px' }} onChange={setFilterTrangThai}>
              <Option value="Tất cả">Tất cả trạng thái</Option>
              <Option value="Mới">Mới</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Chờ duyệt">Chờ duyệt</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
            </Select>

            <Select defaultValue="Tất cả" style={{ width: '100%', minWidth: '160px', maxWidth: '220px' }} onChange={setFilterDonVi}>
              <Option value="Tất cả">Tất cả đơn vị</Option>
              {units.map(u => (
                <Option key={u.id} value={u.tenDonVi}>{u.tenDonVi}</Option>
              ))}
              <Option value="Chưa phân công">Chưa phân công</Option>
            </Select>
          </Space>

          {/* Nút Xuất file tràn full chiều ngang nếu là ĐT */}
          <Button 
            type="default" 
            icon={<DownloadOutlined />} 
            onClick={handleExport} 
            style={{ borderColor: '#10b981', color: '#10b981', width: isMobile ? '100%' : 'auto' }}
          >
            Xuất dữ liệu
          </Button>
        </div>

        {/* 👉 ĐÃ SỬA: Đã XÓA rowSelection (gây lỗi) & Cập nhật phân trang chuẩn */}
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          scroll={{ x: 1000 }} 
          bordered
          pagination={{ 
            pageSize: 8,
            showSizeChanger: false, 
            showLessItems: true,    
            simple: isMobile        
          }}
        />
      </Card>
<ReportDetail 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        data={selectedRecord} 
        mode="unit" 
      />
    </div>
  );
};

export default ResultReport;