// src/pages/StatisticalReport.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Button, Table, Typography, message } from 'antd';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const StatisticalReport = () => {
  const [data, setData] = useState([]); // Dữ liệu gốc
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu sau khi lọc (Dùng để vẽ biểu đồ)
  const [selectedDates, setSelectedDates] = useState(null); // Lưu trữ ngày người dùng chọn

  // 1. GỌI API LẤY DỮ LIỆU
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
            ngayGuiGoc: item.ngayGui ? new Date(item.ngayGui) : null, // THÊM DÒNG NÀY ĐỂ MÁY TÍNH DỄ LỌC NGÀY
            trangThai: item.trangThai,
          }));
          setData(formattedData);
          setFilteredData(formattedData); // Mặc định hiển thị tất cả
        }
      })
      .catch(err => console.error("Lỗi lấy dữ liệu:", err));
  }, []);

  // 2. HÀM XỬ LÝ LỌC THEO NGÀY
  const handleFilter = () => {
    if (!selectedDates || selectedDates.length === 0) {
      setFilteredData(data); // Nếu không chọn ngày mà bấm lọc -> Hiện tất cả
      message.info('Đang hiển thị toàn bộ dữ liệu');
      return;
    }

    // Lấy ngày bắt đầu và ngày kết thúc từ RangePicker
    const startDate = selectedDates[0].toDate();
    startDate.setHours(0, 0, 0, 0); // Lấy từ 00:00:00 của ngày bắt đầu

    const endDate = selectedDates[1].toDate();
    endDate.setHours(23, 59, 59, 999); // Lấy đến 23:59:59 của ngày kết thúc

    // Tiến hành lọc dữ liệu
    const newData = data.filter(item => {
      if (!item.ngayGuiGoc) return false;
      return item.ngayGuiGoc >= startDate && item.ngayGuiGoc <= endDate;
    });

    setFilteredData(newData);
    message.success(`Đã lọc ra ${newData.length} vụ việc trong khoảng thời gian này`);
  };

  // ==========================================
  // LƯU Ý: TOÀN BỘ CODE TÍNH TOÁN DƯỚI ĐÂY PHẢI ĐỔI TỪ `data` SANG `filteredData`
  // ==========================================

  // 3. TÍNH TOÁN DỮ LIỆU CHO CÁC THẺ THỐNG KÊ
  const totalReports = filteredData.length;
  const completedReports = filteredData.filter(item => item.trangThai === 'Hoàn thành').length;
  const processingReports = filteredData.filter(item => item.trangThai === 'Đang xử lý').length;
  const newReports = filteredData.filter(item => item.trangThai === 'Mới').length;

  // 4. TÍNH TOÁN DỮ LIỆU CHO BIỂU ĐỒ TRÒN
  const mangStats = filteredData.reduce((acc, curr) => {
    acc[curr.mang] = (acc[curr.mang] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(mangStats).map(key => ({ name: key, value: mangStats[key] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6'];

  // 5. TÍNH TOÁN DỮ LIỆU CHO BIỂU ĐỒ CỘT
  const trangThaiStats = filteredData.reduce((acc, curr) => {
    acc[curr.trangThai] = (acc[curr.trangThai] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(trangThaiStats).map(key => ({ name: key, soLuong: trangThaiStats[key] }));

  // Cấu hình cột cho bảng chi tiết
  const columns = [
    { title: 'STT', dataIndex: 'stt', width: 60, align: 'center' },
    { title: 'Tiêu đề', dataIndex: 'tieuDe' },
    { title: 'Mảng vi phạm', dataIndex: 'mang' },
    { title: 'Trạng thái', dataIndex: 'trangThai' },
    { title: 'Ngày gửi', dataIndex: 'ngayGui' },
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
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Báo cáo & Thống kê</Title>
        <Space>
          <RangePicker 
            format="DD/MM/YYYY" 
            placeholder={['Từ ngày', 'Đến ngày']} 
            onChange={(dates) => setSelectedDates(dates)} // Lấy ngày người dùng chọn
          />
          <Button type="primary" icon={<FilterOutlined />} onClick={handleFilter}>Lọc</Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ backgroundColor: '#10b981', color: 'white', border: 'none' }}>
            Xuất Báo Cáo
          </Button>
        </Space>
      </div>

      {/* HÀNG 1: CÁC THẺ SỐ LIỆU TỔNG QUAN */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
            <Statistic title="Tổng số phản ánh" value={totalReports} valueStyle={{ color: '#1f2937', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
            <Statistic title="Đã hoàn thành" value={completedReports} valueStyle={{ color: '#10b981', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
            <Statistic title="Đang xử lý" value={processingReports} valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #ef4444' }}>
            <Statistic title="Phản ánh mới" value={newReports} valueStyle={{ color: '#ef4444', fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      {/* HÀNG 2: BIỂU ĐỒ TRỰC QUAN */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Tỷ lệ phản ánh theo Mảng vi phạm" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
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

        <Col span={12}>
          <Card title="Thống kê theo Trạng thái xử lý" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
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

      {/* HÀNG 3: BẢNG DỮ LIỆU CHI TIẾT */}
      <Card title="Danh sách dữ liệu chi tiết" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 5 }} />
      </Card>
    </div>
  );
};

export default StatisticalReport;