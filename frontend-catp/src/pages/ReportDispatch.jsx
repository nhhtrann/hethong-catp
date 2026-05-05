// src/pages/TiepNhanDieuPhoi.jsx
import React, { useState, useEffect } from 'react';
import ReportDetail from './ReportDetail'; // (Chỉnh lại đường dẫn nếu cần)
import { Table, Tag, Space, Button, Input, Select, Card, Typography } from 'antd';
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const ReportDispatch = () => {
  // Dữ liệu giả lập (Mock data) 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu dùng để hiển thị lên bảng
  
  // Các biến lưu điều kiện lọc
  const [searchText, setSearchText] = useState('');
  const [filterMang, setFilterMang] = useState(null);
  const [filterTrangThai, setFilterTrangThai] = useState(null);
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
          donVi: item.donViXuLy || 'Chưa phân công', // Tạm thời để trống vì chưa nối bảng Units
          trangThai: item.trangThai,
          noiDung: item.noiDung,
          ghiChu: item.ghiChuKetQua,
          anhKetQua: item.anhKetQua // Lưu nguyên chuỗi JSON để đổ vào Modal sau này
        }));
        
        // Cập nhật dữ liệu thật vào Bảng
        setData(formattedData);
        setFilteredData(formattedData);
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
    const headers = ['STT', 'Tiêu đề', 'Mảng vi phạm', 'Ngày gửi', 'Đơn vị', 'Trạng thái'];
    
    // Tạo các dòng dữ liệu
    const rows = filteredData.map((item, index) => [
      index + 1,
      `"${item.tieuDe}"`, // Thêm ngoặc kép để tránh lỗi nếu tiêu đề có dấu phẩy
      `"${item.mang}"`,
      `"${item.ngayGui}"`,
      `"${item.donVi}"`,
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20,
        flexWrap: 'wrap', // Tự động rớt dòng nếu màn hình quá nhỏ
        gap: '10px'
      }}>
        {/* Nhóm bên trái: Tìm kiếm và Lọc */}
        <Space wrap>
          <Input 
            placeholder="Tìm kiếm tiêu đề, nội dung..." 
            prefix={<SearchOutlined />} 
            style={{ width: 250 }} // Thu nhỏ lại một chút
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select defaultValue="Tất cả" style={{ width: 140 }} onChange={(value) => setFilterMang(value)}>
            <Select.Option value="Tất cả">Tất cả mảng</Select.Option>
            <Select.Option value="Giao thông">Giao thông</Select.Option>
            <Select.Option value="Bạo lực">Bạo lực</Select.Option>
            <Select.Option value="Ma túy">Ma túy</Select.Option>
            <Select.Option value="An ninh Trật tự">An ninh Trật tự</Select.Option>
          </Select>
          <Select defaultValue="Tất cả" style={{ width: 150 }} onChange={(value) => setFilterTrangThai(value)}>
            <Select.Option value="Tất cả">Tất cả trạng thái</Select.Option>
            <Select.Option value="Mới">Mới</Select.Option>
            <Select.Option value="Đang xử lý">Đang xử lý</Select.Option>
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
      <ReportDetail 
  visible={isModalVisible} 
  onClose={() => setIsModalVisible(false)} 
  data={selectedRecord} 
/>
    </div>
    
  );
};

export default ReportDispatch;