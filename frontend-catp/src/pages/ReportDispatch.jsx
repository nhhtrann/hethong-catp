// src/pages/ReportDispatch.jsx
import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Input, Space, Button, Select } from 'antd'; 
import { SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'; 
import * as XLSX from 'xlsx';
import ReportDetail from '../pages/ReportDetail';

const { Title } = Typography;

const ReportDispatch = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
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
            anhKiemChung : item.anhKiemChung, 
            ngayGui: item.ngayGui ? new Date(item.ngayGui).toLocaleDateString('vi-VN') : '',
          }));
          setData(formattedData);
          setFilteredData(formattedData);
        }
      })
      .catch(error => console.error('Lỗi khi gọi API:', error));
  }, []);

  useEffect(() => {
    let result = data;

    if (searchText) {
      const lowercasedFilter = searchText.toLowerCase();
      result = result.filter(item => 
        item.tieuDe?.toLowerCase().includes(lowercasedFilter) ||
        item.noiDung?.toLowerCase().includes(lowercasedFilter)
      );
    }

    if (filterMang && filterMang !== 'Tất cả') {
      result = result.filter(item => item.mang === filterMang);
    }

    if (filterTrangThai && filterTrangThai !== 'Tất cả') {
      result = result.filter(item => item.trangThai === filterTrangThai);
    }

    setFilteredData(result);
  }, [searchText, filterMang, filterTrangThai, data]);

  const handleExport = () => {
    const exportData = filteredData.map((item, index) => ({
      'STT': index + 1,
      'Tiêu đề vụ việc': item.tieuDe,
      'Mảng vi phạm': item.mang,
      'Ngày gửi': item.ngayGui,
      'Đơn vị xử lý': item.donViXuLy ? `Đơn vị số ${item.donViXuLy}` : 'Chưa phân công',
      'Trạng thái': item.trangThai?.toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const columnWidths = [{ wch: 5 }, { wch: 45 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh_Sach_Phan_Anh");
    XLSX.writeFile(workbook, "Bao_Cao_CATP.xlsx");
  };

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' },
    { 
      title: 'Tiêu đề vụ việc', 
      dataIndex: 'tieuDe', 
      key: 'tieuDe', 
      width: '30%',
      render: (text) => <span style={{ fontWeight: 600, color: '#1f2937' }}>{text}</span>
    },
    { title: 'Mảng vi phạm', dataIndex: 'mang', key: 'mang', width: '15%' },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', key: 'ngayGui', width: '12%' },
    { 
      title: 'Đơn vị xử lý', 
      dataIndex: 'donViXuLy', 
      key: 'donViXuLy',
      // 🟢 Ép buộc dùng thẻ div và CSS gốc để lên màu chuẩn
      render: (val) => val ? (
        <div style={{ 
          backgroundColor: '#f1f5f9', 
          color: '#334155', 
          padding: '4px 10px', 
          borderRadius: '4px', 
          fontWeight: 600, 
          display: 'inline-block' 
        }}>
          {val}
        </div>
      ) : <span style={{ color: '#9ca3af' }}>Chưa phân công</span>
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      render: (trangThai) => {
        let bgColor = '#e5e7eb'; 
        let textColor = '#374151'; 
        
        let text = trangThai ? trangThai.normalize('NFC').toUpperCase().trim() : '';
        
        // 🟢 Cấu hình màu nền đặc (Solid Background)
        if (text.includes('MỚI') || text.includes('CHƯA')) { bgColor = '#f97316'; textColor = '#fff'; } 
        else if (text.includes('ĐANG')) { bgColor = '#3b82f6'; textColor = '#fff'; } 
        else if (text.includes('ĐÃ') || text.includes('HOÀN')) { bgColor = '#10b981'; textColor = '#fff'; } 
        else if (text.includes('CHỜ')) { bgColor = '#8b5cf6'; textColor = '#fff'; } 
        
        // 🟢 Ép buộc dùng CSS gốc, từ chối thư viện Ant Design can thiệp
        return (
          <div style={{ 
            backgroundColor: bgColor, 
            color: textColor, 
            padding: '4px 12px', 
            borderRadius: '4px', 
            fontWeight: '600',
            fontSize: '12px',
            display: 'inline-block',
            textAlign: 'center',
            minWidth: '90px'
          }}>
            {text}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => {
            setSelectedRecord(record);
            setIsModalVisible(true);
          }}
          style={{ padding: '0 12px', fontSize: '13px' }}
        >
          Điều phối
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginTop: 0, fontWeight: 700, color: '#1e293b' }}>Tiếp nhận & Điều phối phản ánh</Title>

      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: '15px' }}>
          <Space wrap style={{ flex: 1 }}>
            <Input placeholder="Tìm kiếm tiêu đề, nội dung..." prefix={<SearchOutlined />} style={{ width: '100%', minWidth: 200, maxWidth: 250 }} onChange={(e) => setSearchText(e.target.value)} />
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

          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất dữ liệu
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          scroll={{ x: 800 }} 
          size="middle" 
          style={{ border: '1px solid #f0f0f0', borderRadius: '4px' }}
        />
      </Card>
      
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