// src/pages/StatisticalReport.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Button, Table, Typography, message, Tag } from 'antd';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
const { Title } = Typography;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1)')) return;
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1)')) return;
  originalConsoleWarn(...args);
};
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
    fetch(`${import.meta.env.VITE_API_URL}/reports`)
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result) && result.length > 0) {

          const formattedData = result.map((item, index) => {
            
            // Lấy thời gian an toàn
            const rawDate = item.ngayGui || item.createdAt || item.ngayTao;

            return {
              key: item.id?.toString() || index.toString(),
              stt: index + 1,
              tieuDe: item.tieuDe,
              mang: item.category ? item.category.tenDanhMuc : 'Chưa phân loại',
              ngayGui: item.ngayGui,
              trangThai: item.trangThai,
            };
          });
          setData(formattedData);
          setFilteredData(formattedData); 
        }
      })
      .catch(err => console.error("Lỗi lấy dữ liệu:", err));
  }, []);

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
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#d946ef'];

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

  const handleExport = async () => {
    // 1. Tạo file Excel và Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Thống kê vi phạm');

    // 2. Định nghĩa các cột với độ rộng tùy chỉnh
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Tiêu đề phản ánh', key: 'tieuDe', width: 45 },
      { header: 'Mảng vi phạm', key: 'mang', width: 25 },
      { header: 'Trạng thái', key: 'trangThai', width: 20 },
      { header: 'Ngày gửi', key: 'ngayGui', width: 20 },
    ];

    // 3. Trang trí dòng Tiêu đề (Row 1)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Chữ trắng in đậm
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF005bac' }, // Nền xanh dương giống Công an
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 4. Bơm dữ liệu từ state filteredData vào Excel
    filteredData.forEach((item) => {
      worksheet.addRow({
        stt: item.stt,
        tieuDe: item.tieuDe,
        mang: item.mang|| 'Chưa phân loại',
        trangThai: item.trangThai?.toUpperCase(),
        ngayGui: item.ngayGui,
      });
    });

    // 5. VẼ KHUNG (BORDER) cho toàn bộ bảng và canh lề dữ liệu
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        // Kẻ viền đen nét mảnh cho 4 cạnh
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        
        // Canh giữa cho các cột (Trừ cột Tiêu đề ở vị trí số 2 thì canh trái cho dễ đọc)
        if (rowNumber !== 1) { 
          cell.alignment = { 
            vertical: 'middle', 
            horizontal: cell.col === 2 ? 'left' : 'center',
            wrapText: true // Tự động xuống dòng nếu chữ dài
          };
        }
      });
    });

    // 6. Xử lý lưu file tải về máy tính
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `ThongKe_AnNinhHocDuong_${new Date().getTime()}.xlsx`);
      message.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      message.error('Có lỗi xảy ra khi xuất file.');
    }
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
              {/* 👉 NẾU CÓ DỮ LIỆU THÌ MỚI VẼ BIỂU ĐỒ */}
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" cy="50%" outerRadius={110} 
                      dataKey="value" stroke="none" 
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} vụ việc`, 'Số lượng']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                /* 👉 CHƯA CÓ DỮ LIỆU THÌ HIỆN CHỮ ĐANG TẢI */
                <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: '#9ca3af' }}>
                  Đang tải dữ liệu...
                </div>
              )}
            </div>

            {/* Bảng chú thích (Chỉ hiện khi có dữ liệu) */}
            {pieData.length > 0 && (
              <div style={{ 
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', 
                gap: '12px 16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #f0f0f0' 
              }}>
                {pieData.map((entry, index) => (
                  <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#4b5563' }}>
                    <span style={{ 
                      display: 'inline-block', width: '12px', height: '12px', 
                      backgroundColor: COLORS[index % COLORS.length], marginRight: '6px', borderRadius: '50%' 
                    }}></span>
                    {entry.name} <strong style={{ marginLeft: '4px', color: '#111827' }}>({entry.value})</strong>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Thống kê theo Trạng thái xử lý" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%' }}>
            
            <div style={{ width: '100%', height: 300 }}> 
              {/* 👉 NẾU CÓ DỮ LIỆU THÌ MỚI VẼ BIỂU ĐỒ */}
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="soLuong" name="Số lượng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                /* 👉 CHƯA CÓ DỮ LIỆU THÌ HIỆN CHỮ ĐANG TẢI */
                <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: '#9ca3af' }}>
                  Đang tải dữ liệu...
                </div>
              )}
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