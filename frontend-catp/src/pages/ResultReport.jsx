// src/pages/ResultReport.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Input, Space, Button } from 'antd';
import { SearchOutlined, DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ResultReport = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/reports')
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result)) {
          // CHỈ LỌC NHỮNG VỤ VIỆC ĐÃ HOÀN THÀNH
          const completedData = result.filter(item => item.trangThai === 'Hoàn thành');
          
          const formattedData = completedData.map((item, index) => ({
            key: item.id?.toString(),
            stt: index + 1,
            tieuDe: item.tieuDe,
            mang: item.mangViPham,
            donVi: item.donViXuLy || 'N/A',
            ghiChu: item.ghiChuKetQua || 'Không có ghi chú',
            ngayGui: item.ngayGui ? new Date(item.ngayGui).toLocaleDateString('vi-VN') : '',
          }));
          setData(formattedData);
        }
      })
      .catch(error => console.error('Lỗi API:', error));
  }, []);

  // Tính năng tìm kiếm trong bảng kết quả
  const filteredData = data.filter(item => 
    item.tieuDe?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.ghiChu?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleExport = () => {
    const headers = ['STT', 'Tiêu đề', 'Mảng vi phạm', 'Đơn vị xử lý', 'Kết quả xử lý', 'Ngày gửi'];
    const rows = filteredData.map(item => [
      item.stt, `"${item.tieuDe}"`, `"${item.mang}"`, `"${item.donVi}"`, `"${item.ghiChu}"`, `"${item.ngayGui}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "ResultReport_Completed.csv";
    link.click();
  };

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' },
    { title: 'Tiêu đề vụ việc', dataIndex: 'tieuDe', key: 'tieuDe', width: '25%' },
    { title: 'Mảng vi phạm', dataIndex: 'mang', key: 'mang', width: '15%' },
    { title: 'Đơn vị xử lý', dataIndex: 'donVi', key: 'donVi', width: '15%' },
    { 
      title: 'Kết quả xử lý', 
      dataIndex: 'ghiChu', 
      key: 'ghiChu',
      render: (text) => <span style={{ color: '#059669', fontWeight: 500 }}><CheckCircleOutlined /> {text}</span>
    },
    { title: 'Thời gian', dataIndex: 'ngayGui', key: 'ngayGui', width: '10%' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginTop: 0 }}>Báo cáo Kết quả xử lý</Title>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <Space>
            <Input 
              placeholder="Tìm theo tiêu đề hoặc kết quả..." 
              prefix={<SearchOutlined />} 
              style={{ width: 300 }} 
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Tag color="green" style={{ fontSize: '14px', padding: '4px 10px' }}>
              Trạng thái: Hoàn thành
            </Tag>
          </Space>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} style={{ backgroundColor: '#10b981' }}>
            Xuất dữ liệu
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          bordered={false}
        />
      </Card>
    </div>
  );
};

export default ResultReport;