// src/pages/PublicAwareness.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Modal, Form, Input, Typography, Space, 
  message, Upload, Image, Tag, Row, Col, Select, DatePicker 
} from 'antd';
import { 
  PlusOutlined, ReadOutlined, ClockCircleOutlined, UserOutlined, 
  SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs'; 

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const PublicAwareness = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  const [searchText, setSearchText] = useState('');
  const [filterTacGia, setFilterTacGia] = useState('Tất cả');
  const [tuNgay, setTuNgay] = useState(null);
  const [denNgay, setDenNgay] = useState(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [form] = Form.useForm();
  const [previewImage, setPreviewImage] = useState(''); 

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingNews, setViewingNews] = useState(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchNews = () => {
    fetch(`${import.meta.env.VITE_API_URL}/news`)
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result)) {
          const reversedResult = [...result].reverse();
          const formattedData = reversedResult.map((item, index) => {
            const isValidDate = item.ngayDang && !isNaN(new Date(item.ngayDang).getTime());
            return {
              ...item,
              key: item.id?.toString(),
              stt: index + 1,
              ngayHienThi: isValidDate ? dayjs(item.ngayDang).format('DD/MM/YYYY') : 'Mới cập nhật',
            };
          });
          setData(formattedData); 
          setFilteredData(formattedData);
        }
      })
      .catch(err => console.error('Lỗi tải tin tức:', err));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    let result = [...data];

    if (searchText) {
      const lowercasedFilter = searchText.toLowerCase();
      result = result.filter(item => item.tieuDe?.toLowerCase().includes(lowercasedFilter));
    }

    if (filterTacGia && filterTacGia !== 'Tất cả') {
      result = result.filter(item => item.tacGia === filterTacGia);
    }

    if (tuNgay || denNgay) {
      const startTimestamp = tuNgay ? tuNgay.startOf('day').valueOf() : 0;
      const endTimestamp = denNgay ? denNgay.endOf('day').valueOf() : Infinity;

      result = result.filter(item => {
        if (!item.ngayDang) return false;
        const itemTime = new Date(item.ngayDang).getTime();
        return itemTime >= startTimestamp && itemTime <= endTimestamp; 
      });
    }

    setFilteredData(result);
  }, [searchText, filterTacGia, tuNgay, denNgay, data]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterTacGia, tuNgay, denNgay]);

  const authors = ['Tất cả', ...new Set(data.map(item => item.tacGia).filter(Boolean))];

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

  const handleSaveNews = async (values) => {
    try {
      const method = editingNews ? 'PATCH' : 'POST';
      const url = editingNews ? `${import.meta.env.VITE_API_URL}/news/${editingNews.id}` : `${import.meta.env.VITE_API_URL}/news`;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tieuDe: values.tieuDe,
          noiDung: values.noiDung,
          tacGia: values.tacGia || 'Ban Tiếp nhận CATP',
          hinhAnh: previewImage, 
          ngayDang: editingNews ? editingNews.ngayDang : new Date().toISOString(), 
        }),
      });

      if (response.ok) {
        message.success(editingNews ? 'Cập nhật thành công!' : 'Đăng bài thành công!');
        setIsModalVisible(false);
        form.resetFields();
        setPreviewImage('');
        setEditingNews(null);
        fetchNews(); 
      } else {
        message.error('Lỗi khi lưu bài viết!');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ!');
    }
  };

  const openEditModal = (record) => {
    setEditingNews(record);
    form.setFieldsValue({
      tieuDe: record.tieuDe,
      tacGia: record.tacGia,
      noiDung: record.noiDung,
    });
    setPreviewImage(record.hinhAnh || ''); 
    setIsModalVisible(true);
  };

  const confirmDelete = (ids) => {
    setDeletingIds(ids);
    setIsDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    try {
      const responses = await Promise.all(deletingIds.map(id => 
        fetch(`${import.meta.env.VITE_API_URL}/news/${id}`, { method: 'DELETE' })
      ));

      const allOk = responses.every(res => res.ok);
      if (allOk) {
        message.success(`Đã xóa ${deletingIds.length} bài viết!`);
        setIsDeleteModalVisible(false);
        setSelectedRowKeys([]);
        fetchNews();
      } else {
        message.error('Có lỗi xảy ra khi xóa trong CSDL!');
      }
    } catch (error) {
      message.error('Lỗi kết nối mạng khi xóa!');
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
    fixed: isMobile ? false : 'left', 
    columnWidth: 40,
  };

  const columns = [
    { title: 'STT', 
      key: 'stt', 
      width: 60, 
      align: 'center',
      render: (text, record, index) => (currentPage - 1) * 8 + index + 1},
    { 
      title: 'Hình ảnh', 
      dataIndex: 'hinhAnh', 
      key: 'hinhAnh', 
      width: 100, 
      align: 'center',
      render: (imgSrc) => (
        <Image 
          width={60} 
          height={40} 
          src={imgSrc} 
          style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #d9d9d9' }} 
          fallback="https://via.placeholder.com/60x40?text=News"
        />
      )
    },
    { title: 'Tiêu đề bài viết', dataIndex: 'tieuDe', key: 'tieuDe', width: 300, ellipsis: true, align: 'center' },
    { 
      title: 'Tác giả', 
      dataIndex: 'tacGia', 
      key: 'tacGia', 
      width: 150,
      align: 'center',
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    { title: 'Ngày đăng', dataIndex: 'ngayHienThi', key: 'ngayHienThi', width: 120, align: 'center' },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right', 
      width: 95,      
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Button type="text" size="small" icon={<EyeOutlined style={{ color: '#10b981', fontSize: '16px' }} />} onClick={() => { setViewingNews(record); setIsViewModalVisible(true); }} title="Xem bài" />
          <Button type="text" size="small" icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} onClick={() => openEditModal(record)} title="Sửa bài" />
          <Button type="text" size="small" icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />} onClick={() => confirmDelete([record.id])} title="Xóa bài" />
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
      maxWidth: '1300px', // 👉 Ép khung rộng để có khoảng hở 2 bên
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
          <Title level={2} style={{ margin: 0, fontSize: 'clamp(24px, 5vw, 36px)' }}>
            Tuyên truyền & Cảnh báo
          </Title>
          <Text type="secondary" style={{ fontSize: 'clamp(14px, 2vw, 16px)' }}>
            Cập nhật tin tức an ninh trật tự, tuyên truyền pháp luật.
          </Text>
        </div>

        <div style={{ 
          position: isMobile ? 'static' : 'absolute', 
          right: 0, 
          top: '50%', 
          transform: isMobile ? 'none' : 'translateY(-50%)' 
        }}>
          <Space wrap style={{ justifyContent: 'center' }}>
            {selectedRowKeys.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={() => confirmDelete(selectedRowKeys)}>
                Xóa {selectedRowKeys.length} mục
              </Button>
            )}
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingNews(null);
                setPreviewImage('');
                form.resetFields();
                setIsModalVisible(true);
              }}
              style={{ backgroundColor: '#10b981', border: 'none' }}
            >
              Đăng tin mới
            </Button>
          </Space>
        </div>

      </div>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', marginBottom: 20 }}>
          <Space wrap style={{ width: '100%' }}>
            <Input 
              placeholder="Tìm kiếm theo tiêu đề..." 
              prefix={<SearchOutlined />} 
              style={{ width: '100%', minWidth: '200px', maxWidth: '300px' }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            
            <Select 
              value={filterTacGia}
              style={{ width: '100%', minWidth: '150px', maxWidth: '200px' }} 
              onChange={setFilterTacGia}
              placeholder="Lọc theo Tác giả"
            >
              {authors.map(author => (
                <Option key={author} value={author}>{author}</Option>
              ))}
            </Select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DatePicker 
                format="DD/MM/YYYY" 
                placeholder="Từ ngày"
                value={tuNgay}
                onChange={(date) => setTuNgay(date)}
                style={{ width: '130px' }} 
              />
              <span style={{ color: '#8c8c8c' }}>-</span>
              <DatePicker 
                format="DD/MM/YYYY" 
                placeholder="Đến ngày"
                value={denNgay}
                onChange={(date) => setDenNgay(date)}
                style={{ width: '130px' }} 
              />
            </div>

            {(searchText || filterTacGia !== 'Tất cả' || tuNgay || denNgay) && (
              <Button 
                type="link" 
                onClick={() => {
                  setSearchText('');
                  setFilterTacGia('Tất cả');
                  setTuNgay(null); 
                  setDenNgay(null); 
                }}
              >
                Bỏ lọc
              </Button>
            )}
          </Space>
        </div>

        {/* 👉 BỔ SUNG: Thanh banner thông báo CHỌN TẤT CẢ giống các trang khác */}
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
                  : `Bạn đang chọn ${selectedRowKeys.length} bài viết.`}
              </span>
            </div>
            
            {selectedRowKeys.length < filteredData.length && (
              <Button 
                type="link" 
                onClick={handleSelectAllAcrossPages} 
                style={{ padding: 0, fontWeight: '500', fontSize: '14px' }}
              >
                Chọn tất cả {filteredData.length} bài viết trong danh sách này
              </Button>
            )}
          </div>
        )}

        <Table 
          size="middle" // 👉 BỔ SUNG: Thu nhỏ khoảng trắng thừa giữa các hàng
          columns={columns} 
          dataSource={filteredData} 
          rowSelection={rowSelection}
          scroll={{ x: 1000 }} 
          bordered
          pagination={{ 
            pageSize: 8,
            current: currentPage, 
            onChange: (page) => setCurrentPage(page) 
          }}
        />
      </Card>

      <Modal
        title={<Title level={4}>{editingNews ? 'Cập nhật bài viết' : 'Đăng bài tuyên truyền mới'}</Title>}
        open={isModalVisible}
        onCancel={() => { setIsModalVisible(false); setPreviewImage(''); }}
        onOk={() => form.submit()}
        okText={editingNews ? 'Lưu thay đổi' : 'Đăng bài'}
        cancelText="Hủy"
        width={750}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSaveNews}>
          <Form.Item name="tieuDe" label="Tiêu đề bài viết" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
            <Input placeholder="Nhập tiêu đề hấp dẫn..." size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="tacGia" label="Cơ quan / Tác giả đăng bài">
                <Input placeholder="VD: Phòng CSGT CATP Huế" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Ảnh minh họa bài viết (Nên có)">
                {previewImage && (
                  <div style={{ marginBottom: '10px', position: 'relative', display: 'inline-block' }}>
                    <Image
                      width={120} height={80} src={previewImage}
                      style={{ objectFit: 'cover', borderRadius: '4px', border: '1px solid #d9d9d9' }}
                    />
                    <Button
                      danger size="small" shape="circle" icon={<DeleteOutlined />}
                      onClick={() => setPreviewImage('')}
                      style={{ position: 'absolute', top: -10, right: -10 }}
                    />
                  </div>
                )}
                {!previewImage && (
                  <Upload showUploadList={false} beforeUpload={handleBeforeUpload} accept="image/*">
                    <div style={{ width: 120, height: 80, border: '1px dashed #d9d9d9', borderRadius: '4px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: '#fafafa' }}>
                      <PlusOutlined />
                      <div style={{ marginTop: 4, fontSize: '12px' }}>Tải ảnh lên</div>
                    </div>
                  </Upload>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="noiDung" label="Nội dung chi tiết" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
            <TextArea rows={8} placeholder="Nhập nội dung bài tuyên truyền..." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[<Button key="close" type="primary" onClick={() => setIsViewModalVisible(false)}>Đóng</Button>]}
        width={800}
        centered
      >
        {viewingNews && (
          <div>
            <Title level={3} style={{ marginBottom: 10 }}>{viewingNews.tieuDe}</Title>
            <div style={{ marginBottom: '20px', color: '#8c8c8c' }}>
              <Space size="large" wrap>
                <span><UserOutlined /> Đăng bởi: {viewingNews.tacGia}</span>
                <span><ClockCircleOutlined /> Thời gian: {viewingNews.ngayHienThi}</span>
              </Space>
            </div>
            
            {viewingNews.hinhAnh && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Image 
                  src={viewingNews.hinhAnh} 
                  alt="Ảnh minh họa" 
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #f0f0f0' }} 
                  fallback="https://via.placeholder.com/600x300?text=Lỗi+hiển+thị+ảnh"
                />
              </div>
            )}
            
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
              {viewingNews.noiDung}
            </Paragraph>
          </div>
        )}
      </Modal>

      <Modal
        title={<span><ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />Xác nhận xóa</span>}
        open={isDeleteModalVisible}
        onOk={executeDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa ngay"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <p>Bạn có chắc chắn muốn xóa <b>{deletingIds.length}</b> bài viết này không?</p>
        <p style={{ color: '#8c8c8c' }}>Hành động này sẽ xóa hoàn toàn hình ảnh và dữ liệu khỏi hệ thống.</p>
      </Modal>
    </div>
  );
};

export default PublicAwareness;