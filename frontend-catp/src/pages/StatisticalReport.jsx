// src/pages/StatisticalReport.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Button, Table, Typography, message, Tag } from 'antd';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const StatisticalReport = () => {
  const [data, setData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  
  // 👉 ĐÃ SỬA: Tách thành 2 biến ngày riêng biệt thay vì 1 mảng
  const [startDate, setStartDate] = useState(null); 
  const [endDate, setEndDate] = useState(null); 

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/reports')
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result)) {
          const formattedData = result.map((item, index) => ({
            key: item.id?.toString() || index.toString(),
            stt: index + 1,
            tieuDe: item.tieuDe,
            mang: item.mangViPham,
            ngayGui: item.ngayGui ? new Date(item.ngayGui).toLocaleDateString('vi-VN') : '',
            ngayGuiGoc: item.ngayGui ? new Date(item.ngayGui) : null, 
            trangThai: item.trangThai,
          }));
          setData(formattedData);
          setFilteredData(formattedData); 
        }
      })
      .catch(err => console.error("Lỗi lấy dữ liệu:", err));
  }, []);

  // 👉 ĐÃ SỬA: Logic lọc hỗ trợ 2 ô lịch đơn lẻ
  const handleFilter = () => {
    if (!startDate && !endDate) {
      setFilteredData(data); 
      message.info('Đang hiển thị toàn bộ dữ liệu');
      return;
    }

    const newData = data.filter(item => {
      if (!item.ngayGuiGoc) return false;
      
      const itemTime = item.ngayGuiGoc.getTime();
      let isAfterStart = true;
      let isBeforeEnd = true;

      // Nếu có chọn Từ ngày
      if (startDate) {
        const start = startDate.toDate();
        start.setHours(0, 0, 0, 0); 
        isAfterStart = itemTime >= start.getTime();
      }

      // Nếu có chọn Đến ngày
      if (endDate) {
        const end = endDate.toDate();
        end.setHours(23, 59, 59, 999); 
        isBeforeEnd = itemTime <= end.getTime();
      }

      return isAfterStart && isBeforeEnd;
    });

    setFilteredData(newData);
    message.success(`Đã lọc ra ${newData.length} vụ việc`);
  };

  const totalReports = filteredData.length;
  const completedReports = filteredData.filter(item => item.trangThai === 'Hoàn thành').length;
const processingReports = filteredData.filter(item => item.trangThai === 'Đang xử lý').length;
  const newReports = filteredData.filter(item => item.trangThai === 'Mới').length;

  const mangStats = filteredData.reduce((acc, curr) => {
    acc[curr.mang] = (acc[curr.mang] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(mangStats).map(key => ({ name: key, value: mangStats[key] }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const trangThaiStats = filteredData.reduce((acc, curr) => {
    acc[curr.trangThai] = (acc[curr.trangThai] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(trangThaiStats).map(key => ({ name: key, soLuong: trangThaiStats[key] }));

  const columns = [
    { title: 'STT', dataIndex: 'stt', width: 60, align: 'center' },
    { title: 'Tiêu đề', dataIndex: 'tieuDe', align: 'center' },
    { title: 'Mảng vi phạm', dataIndex: 'mang', align: 'center' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trangThai', 
      align: 'center',
      render: (val) => {
        let color = val === 'Hoàn thành' ? 'green' : (val === 'Đang xử lý' ? 'gold' : (val === 'Mới' ? 'volcano' : 'blue'));
        return <Tag color={color}>{val?.toUpperCase()}</Tag>;
      }
    },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', align: 'center' },
  ];

  const handleExport = () => {
    const headers = ['STT', 'Tiêu đề', 'Mảng vi phạm', 'Trạng thái', 'Ngày gửi'];
    const rows = filteredData.map(item => [item.stt, `"${item.tieuDe}"`, `"${item.mang}"`, `"${item.trangThai}"`, `"${item.ngayGui}"`]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "StatisticalReport_FilteredByDate.csv";
    link.click();
  };

  return (
    <div style={{ padding: 'clamp(10px, 2vw, 24px)', overflowX: 'hidden' }}>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24,
        gap: '16px' 
      }}>
        <Title level={2} style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', textAlign: 'center' }}>
          Báo cáo & Thống kê
        </Title>
        <Space wrap style={{ justifyContent: isMobile ? 'center' : 'flex-end', width: isMobile ? '100%' : 'auto' }}>
          
          {/* 👉 ĐÃ SỬA: Thay RangePicker thành 2 thẻ DatePicker riêng biệt */}
          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
            <DatePicker 
              format="DD/MM/YYYY" 
              placeholder="Từ ngày" 
              onChange={(date) => setStartDate(date)} 
              style={{ flex: 1, minWidth: '120px' }} 
            />
            <DatePicker 
              format="DD/MM/YYYY"
placeholder="Đến ngày" 
              onChange={(date) => setEndDate(date)} 
              style={{ flex: 1, minWidth: '120px' }} 
            />
          </div>

          <Button type="primary" icon={<FilterOutlined />} onClick={handleFilter}>Lọc</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>
            Xuất
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
            <Statistic title="Tổng số phản ánh" value={totalReports} valueStyle={{ color: '#1f2937', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
            <Statistic title="Đã hoàn thành" value={completedReports} valueStyle={{ color: '#10b981', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
            <Statistic title="Đang xử lý" value={processingReports} valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #ef4444' }}>
            <Statistic title="Phản ánh mới" value={newReports} valueStyle={{ color: '#ef4444', fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Tỷ lệ phản ánh theo Mảng vi phạm" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%' }}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Thống kê theo Trạng thái xử lý" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%' }}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
<BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="soLuong" name="Số lượng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Danh sách dữ liệu chi tiết" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          bordered
          scroll={{ x: 800 }} 
          pagination={{ 
            pageSize: 5,
            simple: isMobile 
          }} 
        />
      </Card>
    </div>
  );
};

export default StatisticalReport;