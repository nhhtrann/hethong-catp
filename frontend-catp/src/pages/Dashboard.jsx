// src/pages/Dashboard.jsx
import React from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
// Import thư viện biểu đồ Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const { Title } = Typography;

const Dashboard = () => {
  // Dữ liệu giả lập (Sau này Phát sẽ viết API trả về cục data y chang thế này)
  const duLieuPhanAnh = [
    { id: 1, mang: "An toàn Giao thông", tongSo: 150, daXuLy: 120, mauSac: "#3b82f6" },
    { id: 2, mang: "Tội phạm Ma túy", tongSo: 45, daXuLy: 38, mauSac: "#ef4444" },
    { id: 3, mang: "Bạo lực học đường", tongSo: 60, daXuLy: 30, mauSac: "#f59e0b" },
    { id: 4, mang: "An ninh Trật tự", tongSo: 85, daXuLy: 80, mauSac: "#10b981" }
  ];

  // Giữ nguyên logic tính toán xuất sắc của bạn
  const tongVuViec = duLieuPhanAnh.reduce((tong, item) => tong + item.tongSo, 0);
  const tongDaXuLy = duLieuPhanAnh.reduce((tong, item) => tong + item.daXuLy, 0);
  const tyLeChung = Math.round((tongDaXuLy / tongVuViec) * 100);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginTop: 0 }}>Tổng quan hệ thống</Title>

      {/* 1. KHU VỰC THẺ THỐNG KÊ (Dùng Row/Col của Ant Design) */}
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Tổng số phản ánh" 
              value={tongVuViec} 
              valueStyle={{ color: '#1f2937', fontWeight: 'bold' }} 
            />
          </Card>
        </Col>
        
        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Đã giải quyết" 
              value={tongDaXuLy} 
              valueStyle={{ color: '#10b981', fontWeight: 'bold' }} 
              prefix={<ArrowUpOutlined />}
              suffix="vụ"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Statistic 
              title="Tỷ lệ hoàn thành" 
              value={tyLeChung} 
              precision={2} // Hiển thị 2 số thập phân nếu cần
              valueStyle={{ color: '#3b82f6', fontWeight: 'bold' }} 
              suffix="%" 
            />
          </Card>
        </Col>
      </Row>

      {/* 2. KHU VỰC BIỂU ĐỒ (Dùng Recharts) */}
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card 
            title="Biểu đồ tiến độ xử lý theo Mảng vi phạm" 
            bordered={false} 
            style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
          >
            {/* ResponsiveContainer giúp biểu đồ tự co giãn theo màn hình */}
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={duLieuPhanAnh}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  {/* Trục X là Tên mảng (mang) */}
                  <XAxis dataKey="mang" />
                  {/* Trục Y là số lượng */}
                  <YAxis />
                  {/* Tooltip hiện ra khi rê chuột vào cột */}
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  
                  {/* Cột Tổng số (Màu xám nhạt) */}
                  <Bar dataKey="tongSo" name="Tổng vụ việc" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  
                  {/* Cột Đã xử lý (Lấy màu theo data của Trân) */}
                  <Bar dataKey="daXuLy" name="Đã giải quyết" radius={[4, 4, 0, 0]}>
                    {duLieuPhanAnh.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.mauSac} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Dashboard;