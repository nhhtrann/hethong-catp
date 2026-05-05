// src/pages/ResultReport.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Input, Space, Button } from 'antd';
import { SearchOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
// IMPORT COMPONENT MODAL DÙNG CHUNG
import ReportDetail from '../pages/ReportDetail'; // (Chỉnh lại đường dẫn nếu cần)

const { Title } = Typography;

const ResultReport = () => {
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  // STATE ĐỂ ĐIỀU KHIỂN BẬT TẮT MODAL
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/reports')
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result)) {
          // Lấy tất cả dữ liệu (Đơn vị cần thấy các vụ 'Đang xử lý' để vào báo cáo)
          const formattedData = result.map((item, index) => ({
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
            anhKiemChung : item.anhKiemChung, // Thêm trường ảnh chứng cứ nếu có
            ngayGui: item.ngayGui ? new Date(item.ngayGui).toLocaleDateString('vi-VN') : '',
          }));
          setData(formattedData);
        }
      })
      .catch(error => console.error('Lỗi API:', error));
  }, []);

  // Lọc theo tìm kiếm
  const filteredData = data.filter(item => 
    item.tieuDe?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.donViXuLy?.toLowerCase().includes(searchText.toLowerCase())
  );

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

  // CỘT DỮ LIỆU CÓ THÊM NÚT "BÁO CÁO"
  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' },
    { title: 'Tiêu đề vụ việc', dataIndex: 'tieuDe', key: 'tieuDe', width: '25%' },
    { title: 'Đơn vị thực hiện', dataIndex: 'donViXuLy', key: 'donViXuLy', width: '20%' },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      render: (trangThai) => {
        let color = trangThai === 'Hoàn thành' ? 'green' : (trangThai === 'Đang xử lý' ? 'gold' : 'blue');
        return <Tag color={color}>{trangThai?.toUpperCase()}</Tag>;
      },
    },
    { title: 'Thời gian', dataIndex: 'ngayGui', key: 'ngayGui', width: '10%' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          size="small"
          onClick={() => {
            setSelectedRecord(record);
            setIsModalVisible(true); // Bật modal khi bấm nút
          }}
          // Đổi màu nút nếu đã hoàn thành (chỉ cho xem)
          style={{ backgroundColor: record.trangThai === 'Hoàn thành' ? '#8c8c8c' : '#1890ff' }}
        >
          {record.trangThai === 'Hoàn thành' ? 'Xem lại' : 'Báo cáo'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginTop: 0 }}>Nhiệm vụ & Báo cáo kết quả</Title>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <Space>
            <Input 
              placeholder="Tìm theo tiêu đề hoặc đơn vị..." 
              prefix={<SearchOutlined />} 
              style={{ width: 300 }} 
              onChange={(e) => setSearchText(e.target.value)}
            />
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

      {/* GẮN MODAL CHUNG NHƯNG ÉP CHẾ ĐỘ UNIT (CƠ QUAN PHƯỜNG) */}
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