// src/pages/ReportDispatch.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Input, Space, Button, Select, Modal, Form, message, Upload, Row, Col } from 'antd'; 
import { 
  SearchOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

import ReportDetail from '../pages/ReportDetail';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ReportDispatch = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterMang, setFilterMang] = useState(null);
  const [filterTrangThai, setFilterTrangThai] = useState(null);
  const [filterDonVi, setFilterDonVi] = useState('Tất cả'); 
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); 

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [units, setUnits] = useState([]); 

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [previewImage, setPreviewImage] = useState('');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 👉 BỔ SUNG: State theo dõi trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/reports` )
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result)) {
          const reversedResult = [...result].reverse();
          const formattedData = reversedResult.map((item, index) => ({
            id: item.id,
            key: item.id?.toString(),
            tieuDe: item.tieuDe,
            mang: item.mangViPham,
            donViXuLy: item.donViXuLy || '',
            trangThai: item.trangThai,
            noiDung: item.noiDung,
            kinhDo: item.kinhDo,
            viDo: item.viDo,
            ghiChu: item.ghiChuKetQua,
            anhKetQua: item.anhKetQua,
            anhKiemChung: item.anhKiemChung,
            ngayGui: item.ngayGui ? new Date(item.ngayGui).toLocaleDateString('vi-VN') : '',
          }));
          
          setData(formattedData); 
          setFilteredData(formattedData);
        }
      })
      .catch(error => console.error('Lỗi khi gọi API:', error));
      
    fetch(`${import.meta.env.VITE_API_URL}/units`)
      .then(res => res.json())
      .then(result => Array.isArray(result) && setUnits(result))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
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

    if (filterDonVi && filterDonVi !== 'Tất cả') {
      if (filterDonVi === 'Chưa phân công') {
        result = result.filter(item => !item.donViXuLy || item.donViXuLy === '');
      } else {
        result = result.filter(item => item.donViXuLy === filterDonVi);
      }
    }

    setFilteredData(result);
    // 👉 BỔ SUNG: Reset về trang 1 khi lọc
    setCurrentPage(1);
  }, [searchText, filterMang, filterTrangThai, filterDonVi, data]);

  const handleBeforeUpload = async (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }
    const base64 = await getBase64(file);
    setPreviewImage(base64);
    return false; 
  };

  const handleAddReport = async (values) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          anhKiemChung: previewImage, 
          trangThai: 'Mới', 
          ngayGui: new Date().toISOString(),
        })
      });

      if (response.ok) {
        message.success('Đã thêm phản ánh mới thành công!');
        setIsAddModalVisible(false);
        addForm.resetFields();
        fetchData();
      } else {
        message.error('Lỗi khi thêm phản ánh!');
      }
    } catch (error) {
      message.error('Không kết nối được với Server!');
    }
  };

  const confirmDelete = (ids) => {
    setDeletingIds(ids);
    setIsDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    try {
      const responses = await Promise.all(deletingIds.map(id => 
        fetch(`${import.meta.env.VITE_API_URL}/reports/${id}`, { method: 'DELETE' })
      ));

      const allOk = responses.every(res => res.ok);

      if (allOk) {
        message.success(`Đã xóa thành công ${deletingIds.length} phản ánh!`);
        setIsDeleteModalVisible(false);
        setSelectedRowKeys([]);
        fetchData();
      } else {
        message.error('Lỗi: Backend từ chối xóa!');
      }
    } catch (error) {
      message.error('Lỗi kết nối mạng khi xóa!');
    }
  };

  const handleExport = () => {
    const headers = ['STT', 'Tiêu đề', 'Mảng vi phạm', 'Ngày gửi', 'Đơn vị xử lý', 'Trạng thái'];
    const rows = filteredData.map((item, index) => [
      index + 1, `"${item.tieuDe}"`, `"${item.mang}"`, `"${item.ngayGui}"`, `"${item.donViXuLy}"`, `"${item.trangThai}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "DanhSachPhanAnh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
    fixed: isMobile ? false : 'left',
    columnWidth: 40,
  };

  const columns = [
    // 👉 ĐÃ SỬA: Render STT dựa theo currentPage
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (text, record, index) => (currentPage - 1) * 8 + index + 1 },
    { title: 'Tiêu đề vụ việc', dataIndex: 'tieuDe', key: 'tieuDe', width: 250, ellipsis: true, align: 'center' },
    { title: 'Mảng vi phạm', dataIndex: 'mang', key: 'mang', width: 140, align: 'center' },
    { title: 'Ngày gửi', dataIndex: 'ngayGui', key: 'ngayGui', width: 120, align: 'center' },
    { 
      title: 'Đơn vị xử lý', 
      dataIndex: 'donViXuLy', 
      key: 'donViXuLy',
      width: 200,
      align: 'center',
      render: (val) => val ? <b style={{ color: '#1890ff' }}>{val}</b> : <span style={{ color: '#999' }}>Chưa phân công</span>
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      width: 140,
      align: 'center',
      render: (trangThai) => {
        let color = trangThai === 'Mới' ? 'volcano' : (trangThai === 'Đang xử lý' ? 'gold' : (trangThai === 'Chờ duyệt' ? 'blue' : 'green'));
        return <Tag color={color}>{trangThai?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right', 
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Button 
            type="text" size="small"
            icon={<EyeOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} 
            onClick={() => { setSelectedRecord(record); setIsModalVisible(true); }}
          />
          <Button 
            type="text" size="small"
            icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />} 
            onClick={() => confirmDelete([record.id])} 
          />
        </Space>
      ),
    },
  ];

  // 👉 BỔ SUNG: Hàm chọn tất cả dữ liệu qua các trang
  const handleSelectAllAcrossPages = () => {
    const allKeys = filteredData.map(item => item.key);
    setSelectedRowKeys(allKeys);
  };

  return (
    <div style={{ 
      padding: 'clamp(10px, 2vw, 24px)', 
      maxWidth: '1300px', // 👉 SỬA: Đổi 1300 thành 1400 để đồng bộ kích thước khung với Quản lý Đơn vị
      margin: '0 auto',   
      overflowX: 'hidden' 
    }}>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        position: 'relative',     
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 28px)' }}>
            Tiếp nhận & Điều phối phản ánh
          </Title>
        </div>

        <div style={{ 
          position: isMobile ? 'static' : 'absolute', 
          right: 0, 
          top: '50%', 
          transform: isMobile ? 'none' : 'translateY(-50%)',
          alignSelf: isMobile ? 'flex-end' : 'auto' 
        }}>
          <Space wrap style={{ justifyContent: 'flex-end' }}>
            {selectedRowKeys.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={() => confirmDelete(selectedRowKeys)}>
                Xóa {selectedRowKeys.length} mục
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
              Thêm phản ánh
            </Button>
          </Space>
        </div>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 20, 
          gap: '16px' 
        }}>
          <Space wrap style={{ flex: 1, width: '100%' }}>
            <Input 
              placeholder="Tìm tiêu đề, nội dung..." 
              prefix={<SearchOutlined />} 
              style={{ width: '100%', minWidth: '200px', maxWidth: '280px' }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select value={filterMang || 'Tất cả'} style={{ width: '100%', minWidth: '130px', maxWidth: '160px' }} onChange={setFilterMang}>
              <Option value="Tất cả">Tất cả mảng</Option>
              <Option value="Giao thông">Giao thông</Option>
              <Option value="Bạo lực">Bạo lực</Option>
              <Option value="Ma túy">Ma túy</Option>
              <Option value="An ninh Trật tự">An ninh Trật tự</Option>
            </Select>
            <Select value={filterTrangThai || 'Tất cả'} style={{ width: '100%', minWidth: '150px', maxWidth: '180px' }} onChange={setFilterTrangThai}>
              <Option value="Tất cả">Tất cả trạng thái</Option>
              <Option value="Mới">Mới</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Chờ duyệt">Chờ duyệt</Option>
              <Option value="Hoàn thành">Hoàn thành</Option>
              <Option value="Trễ hạn">Trễ hạn</Option>
            </Select>
            <Select value={filterDonVi} style={{ width: '100%', minWidth: '160px', maxWidth: '220px' }} onChange={setFilterDonVi}>
              <Option value="Tất cả">Tất cả đơn vị</Option>
                {units.map(u => (
                <Option key={u.id} value={u.tenDonVi}>{u.tenDonVi}</Option>
                ))}
                <Option value="Chưa phân công">Chưa phân công</Option>
            </Select>

            {/* Thêm nút Bỏ lọc để tiện sử dụng */}
            {(searchText || filterMang !== 'Tất cả' || filterTrangThai !== 'Tất cả' || filterDonVi !== 'Tất cả') && (
              <Button type="link" onClick={() => {
                setSearchText('');
                setFilterMang('Tất cả');
                setFilterTrangThai('Tất cả');
                setFilterDonVi('Tất cả');
              }}>
                Bỏ lọc
              </Button>
            )}
          </Space>

          <Button 
            type="default" 
            icon={<DownloadOutlined />} 
            onClick={handleExport} 
            style={{ borderColor: '#10b981', color: '#10b981', width: isMobile ? '100%' : 'auto' }}
          >
            Xuất dữ liệu
          </Button>
        </div>

        {/* 👉 BỔ SUNG: Thanh banner thông báo CHỌN TẤT CẢ */}
        {selectedRowKeys.length > 0 && (
          <div style={{ 
            backgroundColor: '#e6f4ff', 
            border: '1px solid #91caff', 
            borderRadius: '6px', 
            padding: '8px 16px', 
            marginBottom: '16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tag 
                closable 
                onClose={() => setSelectedRowKeys([])}
                color="blue" 
                style={{ fontSize: '14px', padding: '2px 8px', margin: 0 }}
              >
                Đã chọn {selectedRowKeys.length}
              </Tag>
              <span style={{ marginLeft: '12px', color: '#595959', fontSize: '14px' }}>
                {selectedRowKeys.length === filteredData.length 
                  ? 'Bạn đã chọn toàn bộ dữ liệu.' 
                  : `Bạn đang chọn ${selectedRowKeys.length} phản ánh.`}
              </span>
            </div>
            
            {selectedRowKeys.length < filteredData.length && (
              <Button 
                type="link" 
                onClick={handleSelectAllAcrossPages} 
                style={{ padding: 0, fontWeight: '500', fontSize: '14px' }}
              >
                Chọn tất cả {filteredData.length} phản ánh trong danh sách này
              </Button>
            )}
          </div>
        )}

        <Table 
          size="middle"
          columns={columns} 
          dataSource={filteredData} 
          rowSelection={rowSelection}
          scroll={{ x: 1200 }} 
          bordered
          // 👉 BỔ SUNG: Map state currentPage vào Pagination
          pagination={{ 
            pageSize: 8,
            showSizeChanger: false,
            showLessItems: true,
            simple: isMobile,
            current: currentPage,
            onChange: (page) => setCurrentPage(page)
          }}
        />
      </Card>
      
      <ReportDetail 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        data={selectedRecord} 
        mode="admin" 
      />

      <Modal
        title="Thêm Phản ánh Mới"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onOk={() => addForm.submit()}
        okText="Lưu phản ánh"
        cancelText="Hủy"
        width={700}
        centered
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddReport}>
          
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item 
                name="tieuDe" 
                label="Tiêu đề vụ việc" 
                rules={[
                  { required: true, message: 'Vui lòng nhập tiêu đề!' },
                  { whitespace: true, message: 'Tiêu đề không được chỉ chứa khoảng trắng!' } // 👉 Chặn chuỗi rỗng
                ]}
              >
                <Input placeholder="Ví dụ: Lấn chiếm lòng lề đường..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                name="mangViPham" 
                label="Mảng vi phạm" 
                rules={[{ required: true, message: 'Vui lòng chọn mảng vi phạm!' }]}
              >
                <Select placeholder="Chọn mảng">
                  <Option value="Trật tự đô thị">Trật tự đô thị</Option>
                  <Option value="Giao thông">Giao thông</Option>
                  <Option value="Môi trường">Môi trường</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="noiDung" 
            label="Nội dung chi tiết" 
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung!' },
              { whitespace: true, message: 'Nội dung không được để toàn khoảng trắng!' } // 👉 Chặn chuỗi rỗng
            ]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết tình hình..." />
          </Form.Item>
          
          <Form.Item label="Ảnh minh chứng (Nếu có)">
            <Upload
              listType="picture-card"
              showUploadList={false} 
              beforeUpload={handleBeforeUpload}
              accept="image/*"
            >
              {previewImage ? (
                <img src={previewImage} alt="minh chứng" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <div>
                  <PlusOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />
                  <div style={{ marginTop: 8, color: '#8c8c8c' }}>Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="nguoiPhanAnh" label="Người phản ánh (Nếu có)">
                <Input placeholder="Tên người gọi/báo tin" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="soDienThoai" label="Số điện thoại">
                <Input placeholder="Số điện thoại liên hệ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="donViXuLy" label="Phân công cho Đơn vị (Có thể chọn sau)">
            <Select placeholder="-- Chọn Đơn vị tiếp nhận --" allowClear>
              {units.map(u => (
                <Option key={u.id} value={u.tenDonVi}>{u.tenDonVi}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span><ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />Xác nhận xóa</span>}
        open={isDeleteModalVisible}
        onOk={executeDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>Bạn có chắc chắn muốn xóa <b>{deletingIds.length}</b> phản ánh này không?</p>
      </Modal>

    </div>
  );
};

export default ReportDispatch;