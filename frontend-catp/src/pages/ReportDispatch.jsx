// src/pages/ReportDispatch.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Input, Space, Button, Select } from 'antd'; // Đã thêm Select
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'; // Đã thêm DownloadOutlined

// IMPORT MODAL DÙNG CHUNG VÀO ĐÂY (Lưu ý đường dẫn thư mục components)
import ReportDetail from '../pages/ReportDetail';

const { Title } = Typography;

const ReportDispatch = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Các biến lưu điều kiện lọc
  const [filterMang, setFilterMang] = useState(null);
  const [filterTrangThai, setFilterTrangThai] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/reports')
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result)) {
          const formattedData = result.map((item, index) => ({
            id: item.id,
            key: item.id?.toString(),
            stt: index + 1,
            tieuDe: item.tieuDe,
            mang: item.mangViPham,
            donViXuLy: item.donViXuLy || '',
            trangThai: item.trangThai,
            noiDung: item.noiDung,
            ghiChu: item.ghiChuKetQua,
            anhKetQua: item.anhKetQua,
            anhKiemChung : item.anhKiemChung, // Thêm trường ảnh chứng cứ nếu có
            ngayGui: item.ngayGui ? new Date(item.ngayGui).toLocaleDateString('vi-VN') : '',
          }));
          setData(formattedData);
          setFilteredData(formattedData);
        }
      })
      .catch(error => console.error('Lỗi khi gọi API:', error));
  }, []);

  // Tự động chạy mỗi khi từ khóa tìm kiếm hoặc bộ lọc thay đổi
  useEffect(() => {
    let result = data;

    // 1. Lọc theo chữ gõ vào (Tìm trong Tiêu đề hoặc Nội dung)
    if (searchText) {
      const lowercasedFilter = searchText.toLowerCase();
      result = result.filter(item => 
        item.tieuDe?.toLowerCase().includes(lowercasedFilter) ||
        item.noiDung?.toLowerCase().includes(lowercasedFilter)
      );
    }

    // 2. Lọc theo Mảng vi phạm
    if (filterMang && filterMang !== 'Tất cả') {
      result = result.filter(item => item.mang === filterMang);
    }

    // 3. Lọc theo Trạng thái
    if (filterTrangThai && filterTrangThai !== 'Tất cả') {
      result = result.filter(item => item.trangThai === filterTrangThai);
    }

    setFilteredData(result);
  }, [searchText, filterMang, filterTrangThai, data]);

  // Hàm xuất dữ liệu ra file CSV
  const handleExport = () => {
    // Tạo dòng tiêu đề
    const headers = ['STT', 'Tiêu đề', 'Mảng vi phạm', 'Ngày gửi', 'Đơn vị xử lý', 'Trạng thái'];
    
    // Tạo các dòng dữ liệu
    const rows = filteredData.map((item, index) => [
      index + 1,
      `"${item.tieuDe}"`, 
      `"${item.mang}"`,
      `"${item.ngayGui}"`,
      `"${item.donViXuLy}"`, // Đã sửa từ item.donVi thành item.donViXuLy
      `"${item.trangThai}"`
    ]);

    // Ghép lại thành cấu trúc file CSV có hỗ trợ tiếng Việt (UTF-8 BOM)
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");

    // Tạo link tải ảo và kích hoạt nó
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DanhSachPhanAnh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' },
    { title: 'Tiêu đề vụ việc', dataIndex: 'tieuDe', key: 'tieuDe', width: '25%' },
    { title: 'Mảng vi phạm', dataIndex: 'mang', key: 'mang', width: '15%' },
    { 
      title: 'Đơn vị xử lý', 
      dataIndex: 'donViXuLy', 
      key: 'donViXuLy',
      render: (val) => val ? <Tag color="purple">{val}</Tag> : <Tag color="default">Chưa phân công</Tag>
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      render: (trangThai) => {
        let color = trangThai === 'Mới' ? 'volcano' : (trangThai === 'Đang xử lý' ? 'gold' : (trangThai === 'Chờ duyệt' ? 'blue' : 'green'));
        return <Tag color={color}>{trangThai?.toUpperCase()}</Tag>;
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
          Điều phối
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginTop: 0 }}>Tiếp nhận & Điều phối phản ánh</Title>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {/* THANH CÔNG CỤ TÌM KIẾM & LỌC */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20,
          flexWrap: 'wrap', 
          gap: '10px'
        }}>
          {/* Nhóm bên trái: Tìm kiếm và Lọc */}
          <Space wrap>
            <Input 
              placeholder="Tìm kiếm tiêu đề, nội dung..." 
              prefix={<SearchOutlined />} 
              style={{ width: 250 }}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select defaultValue="Tất cả" style={{ width: 140 }} onChange={(value) => setFilterMang(value)}>
              <Select.Option value="Tất cả">Tất cả mảng</Select.Option>
              <Select.Option value="Giao thông">Giao thông</Select.Option>
              <Select.Option value="Bạo lực">Bạo lực</Select.Option>
              <Select.Option value="Ma túy">Ma túy</Select.Option>
              <Select.Option value="An ninh Trật tự">An ninh Trật tự</Select.Option>
            </Select>
            <Select defaultValue="Tất cả" style={{ width: 160 }} onChange={(value) => setFilterTrangThai(value)}>
              <Select.Option value="Tất cả">Tất cả trạng thái</Select.Option>
              <Select.Option value="Mới">Mới</Select.Option>
              <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
              <Select.Option value="Chờ duyệt">Chờ duyệt</Select.Option>
              <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
              <Select.Option value="Trễ hạn">Trễ hạn</Select.Option>
            </Select>
          </Space>

          {/* Nhóm bên phải: Nút Xuất dữ liệu */}
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất dữ liệu
          </Button>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <Table 
          columns={columns} 
          dataSource={filteredData} 
        />
      </Card>
      
      {/* GỌI MODAL DÙNG CHUNG VỚI QUYỀN ADMIN */}
      <ReportDetail 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        data={selectedRecord} 
        mode="admin" 
      />
    </div>
  );
};

export default ReportDispatch;