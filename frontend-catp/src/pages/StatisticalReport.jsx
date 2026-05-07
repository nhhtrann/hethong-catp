import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Button, Table, Typography, message, Tag } from 'antd';
import { DownloadOutlined, FilterOutlined, PieChartOutlined, BarChartOutlined, TableOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 🟢 CẤU HÌNH MÀU SẮC ĐỒNG BỘ TOÀN HỆ THỐNG
const STATUS_COLORS = {
  'HOÀN THÀNH': '#10b981', 
  'ĐANG XỬ LÝ': '#f59e0b', 
  'MỚI': '#ef4444',        
  'CHƯA XỬ LÝ': '#ef4444',
  'ĐÃ XỬ LÝ': '#10b981',
  'DEFAULT': '#64748b'    
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];

const StatisticalReport = () => {
  const [data, setData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [selectedDates, setSelectedDates] = useState(null); 

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
            trangThai: item.trangThai || 'Mới',
          }));
          setData(formattedData);
          setFilteredData(formattedData); 
        }
      })
      .catch(err => console.error("Lỗi lấy dữ liệu:", err));
  }, []);

  const handleFilter = () => {
    if (!selectedDates || selectedDates.length === 0) {
      setFilteredData(data); 
      message.info('Đang hiển thị toàn bộ dữ liệu');
      return;
    }
    const startDate = selectedDates[0].toDate();
    startDate.setHours(0, 0, 0, 0); 
    const endDate = selectedDates[1].toDate();
    endDate.setHours(23, 59, 59, 999); 

    const newData = data.filter(item => {
      if (!item.ngayGuiGoc) return false;
      return item.ngayGuiGoc >= startDate && item.ngayGuiGoc <= endDate;
    });
    setFilteredData(newData);
    message.success(`Đã lọc ra ${newData.length} vụ việc`);
  };

  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      'STT': item.stt,
      'Tiêu đề': item.tieuDe,
      'Mảng vi phạm': item.mang,
      'Trạng thái': item.trangThai?.toUpperCase(),
      'Ngày gửi': item.ngayGui
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [{ wch: 5 }, { wch: 50 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Thong_Ke");
    XLSX.writeFile(workbook, `Bao_Cao_Thong_Ke_${new Date().getTime()}.xlsx`);
  };

  // Logic tính toán biểu đồ
  const totalReports = filteredData.length;
  const completed = filteredData.filter(i => i.trangThai.toUpperCase().includes('HOÀN') || i.trangThai.toUpperCase().includes('ĐÃ')).length;
  const processing = filteredData.filter(i => i.trangThai.toUpperCase().includes('ĐANG')).length;
  const newly = totalReports - completed - processing;

  const mangStats = filteredData.reduce((acc, curr) => {
    acc[curr.mang] = (acc[curr.mang] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(mangStats).map(key => ({ name: key, value: mangStats[key] }));

  const barData = [
    { name: 'Mới', value: newly },
    { name: 'Đang xử lý', value: processing },
    { name: 'Đã xử lý', value: completed },
  ];

  const columns = [
    { title: 'STT', dataIndex: 'stt', width: 70, align: 'center', render: (t) => <span style={{color: '#94a3b8'}}>{t}</span> },
    { title: 'Tiêu đề vụ việc', dataIndex: 'tieuDe', render: (t) => <Text strong>{t}</Text> },
    { title: 'Mảng vi phạm', dataIndex: 'mang', width: 180, render: (t) => <Tag color="blue">{t}</Tag> },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trangThai', 
      width: 150, 
      align: 'center',
      render: (val) => {
        const text = val?.toUpperCase();
        let color = STATUS_COLORS['DEFAULT'];
        if (text.includes('ĐÃ') || text.includes('HOÀN')) color = STATUS_COLORS['HOÀN THÀNH'];
        else if (text.includes('ĐANG')) color = STATUS_COLORS['ĐANG XỬ LÝ'];
        else if (text.includes('MỚI') || text.includes('CHƯA')) color = STATUS_COLORS['MỚI'];
        
        return (
          <div style={{ backgroundColor: color, color: '#fff', padding: '4px 0', borderRadius: '4px', fontWeight: '700', fontSize: '11px', width: '100px', margin: '0 auto' }}>
            {text}
          </div>
        );
      }
    },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', width: 130 }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Báo cáo & Thống kê</Title>
        <Space>
          <RangePicker format="DD/MM/YYYY" onChange={(dates) => setSelectedDates(dates)} />
          <Button type="primary" icon={<FilterOutlined />} onClick={handleFilter}>Lọc</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>Xuất Excel</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stat-card" style={{ borderLeft: '5px solid #3b82f6' }}>
            <Statistic title="Tổng số phản ánh" value={totalReports} valueStyle={{ fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stat-card" style={{ borderLeft: `5px solid ${STATUS_COLORS['HOÀN THÀNH']}` }}>
            <Statistic title="Đã hoàn thành" value={completed} valueStyle={{ color: STATUS_COLORS['HOÀN THÀNH'], fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stat-card" style={{ borderLeft: `5px solid ${STATUS_COLORS['ĐANG XỬ LÝ']}` }}>
            <Statistic title="Đang xử lý" value={processing} valueStyle={{ color: STATUS_COLORS['ĐANG XỬ LÝ'], fontWeight: 800 }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stat-card" style={{ borderLeft: `5px solid ${STATUS_COLORS['MỚI']}` }}>
            <Statistic title="Phản ánh mới" value={newly} valueStyle={{ color: STATUS_COLORS['MỚI'], fontWeight: 800 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<span><PieChartOutlined /> Tỷ lệ theo Mảng vi phạm</span>} bordered={false} className="chart-card">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<span><BarChartOutlined /> Thống kê Trạng thái</span>} bordered={false} className="chart-card">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                    {barData.map((entry, index) => {
                      let color = STATUS_COLORS['MỚI'];
                      if (entry.name === 'Đang xử lý') color = STATUS_COLORS['ĐANG XỬ LÝ'];
                      if (entry.name === 'Đã xử lý') color = STATUS_COLORS['HOÀN THÀNH'];
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title={<span><TableOutlined /> Danh sách dữ liệu chi tiết</span>} bordered={false} className="chart-card">
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 5 }} scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
};

export default StatisticalReport;