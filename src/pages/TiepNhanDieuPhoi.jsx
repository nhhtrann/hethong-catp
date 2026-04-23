// src/pages/TiepNhanDieuPhoi.jsx
import ChiTietPhanAnh from '../pages/ChiTietPhanAnh'; // (Chỉnh lại đường dẫn nếu cần)
import React, { useState } from 'react';
import { Table, Tag, Space, Button, Input, Select, Card, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const TiepNhanDieuPhoi = () => {
  // Dữ liệu giả lập (Mock data) chờ API của Phát
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([
    {
      key: '1', // Ant Design Table cần trường 'key' cho mỗi dòng
      stt: 1,
      tieuDe: 'HS đánh nhau ở cổng trường',
      mang: 'Bạo lực',
      ngayGui: '23/04/2026',
      donVi: 'CA Phường Phú Nhuận',
      trangThai: 'Đang xử lý',
    },
    {
      key: '2',
      stt: 2,
      tieuDe: 'Tụ tập đua xe',
      mang: 'Giao thông',
      ngayGui: '22/04/2026',
      donVi: 'CSGT TP',
      trangThai: 'Hoàn thành',
    },
    {
      key: '3',
      stt: 3,
      tieuDe: 'Phát hiện hút thuốc lá điện tử',
      mang: 'An ninh Trật tự',
      ngayGui: '21/04/2026',
      donVi: 'CA Phường Vĩ Dạ',
      trangThai: 'Mới',
    },
  ]);

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