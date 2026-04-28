// src/pages/TiepNhanDieuPhoi.jsx
import React, { useState, useEffect } from 'react';
import ChiTietPhanAnh from '../pages/ChiTietPhanAnh'; // (Chỉnh lại đường dẫn nếu cần)
import { Table, Tag, Space, Button, Input, Select, Card, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const TiepNhanDieuPhoi = () => {
  // Dữ liệu giả lập (Mock data) chờ API của Phát
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([]);
// Dùng useEffect để tự động gọi API ngay khi mở trang
  useEffect(() => {
    // Gọi API GET từ Backend NestJS
    fetch('http://localhost:3000/reports')
      .then(response => response.json())
      .then(result => {
        // Biến đổi dữ liệu Backend trả về cho khớp với bảng Ant Design
        const formattedData = result.map((item, index) => ({
          id : item.id, // Lưu ID gốc để dùng khi cần gọi API PATCH
          key: item.id.toString(), // Khóa duy nhất cho bảng
          stt: index + 1,
          tieuDe: item.tieuDe,
          mang: item.mangViPham,
          ngayGui: item.ngayGui ? new Date(item.ngayGui).toLocaleDateString('vi-VN') : '',
          donVi: 'Chưa phân công', // Tạm thời để trống vì chưa nối bảng Units
          trangThai: item.trangThai,
          noiDung: item.noiDung,
          ghiChu: item.ghiChuKetQua,
          anhKetQua: item.anhKetQua // Lưu nguyên chuỗi JSON để đổ vào Modal sau này
        }));
        
        // Cập nhật dữ liệu thật vào Bảng
        setData(formattedData);
      })
      .catch(error => console.error('Lỗi khi gọi API:', error));
  }, []);
  // Cấu hình các cột cho Bảng
  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' },
    { title: 'Tiêu đề vụ việc', dataIndex: 'tieuDe', key: 'tieuDe' },
    { title: 'Mảng vi phạm', dataIndex: 'mang', key: 'mang' },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', key: 'ngayGui' },
    { title: 'Đơn vị xử lý', dataIndex: 'donVi', key: 'donVi' },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      render: (trangThai) => {
        // Tự động tô màu thẻ Tag dựa trên chữ Trạng thái
        let color = 'blue';
        if (trangThai === 'Hoàn thành') color = 'green';
        if (trangThai === 'Trễ hạn') color = 'volcano';
        if (trangThai === 'Mới') color = 'geekblue';
        if (trangThai === 'Đang xử lý') color = 'gold';
        return <Tag color={color} key={trangThai}>{trangThai.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => {
            setSelectedRecord(record);
            setIsModalVisible(true);
          }}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginTop: 0 }}>Tiếp nhận & Điều phối phản ánh</Title>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Input 
              placeholder="Nhập tiêu đề hoặc mã vụ việc..." 
              prefix={<SearchOutlined />} 
              style={{ width: 300 }} 
            />
            <Select defaultValue="all" style={{ width: 150 }}>
              <Option value="all">Tất cả mảng</Option>
              <Option value="giaothong">Giao thông</Option>
              <Option value="baoluc">Bạo lực học đường</Option>
            </Select>
            <Select defaultValue="all" style={{ width: 150 }}>
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="moi">Mới</Option>
              <Option value="dangxuly">Đang xử lý</Option>
              <Option value="hoanthanh">Hoàn thành</Option>
            </Select>
          </Space>
          
          <Button type="primary" style={{ backgroundColor: '#10b981' }} icon={<DownloadOutlined />}>
            Xuất Excel
          </Button>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{ pageSize: 5 }} // Tự động phân trang, mỗi trang 5 dòng
          bordered
        />
      </Card>
      <ChiTietPhanAnh 
  visible={isModalVisible} 
  onClose={() => setIsModalVisible(false)} 
  data={selectedRecord} 
/>
    </div>
    
  );
};

export default TiepNhanDieuPhoi;