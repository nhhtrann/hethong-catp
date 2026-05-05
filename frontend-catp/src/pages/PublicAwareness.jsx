// src/pages/PublicAwareness.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Typography, Row, Col, message, Tag, Upload, Popconfirm, Space } from 'antd';
import { 
  PlusOutlined, ReadOutlined, ClockCircleOutlined, UserOutlined, 
  UploadOutlined, EditOutlined, DeleteOutlined, EyeOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const PublicAwareness = () => {
  const [newsList, setNewsList] = useState([]);
  
  // States cho Modal Thêm/Sửa
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState(null); // Lưu thông tin bài viết đang sửa
  const [form] = Form.useForm();

  // States cho Modal Xem chi tiết
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingNews, setViewingNews] = useState(null);

  // 1. GỌI API LẤY DANH SÁCH BÀI VIẾT
  const fetchNews = () => {
    fetch('http://localhost:3000/news')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNewsList(data);
        else setNewsList([]);
      })
      .catch(err => {
        console.error('Lỗi tải tin tức:', err);
        setNewsList([]);
      });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // 2. HÀM XỬ LÝ LƯU (DÙNG CHUNG CHO CẢ THÊM MỚI VÀ SỬA)
  const handleSaveNews = async (values) => {
    try {
      // Xử lý lấy tên file ảnh nếu có upload
      let tenFileAnh = 'https://via.placeholder.com/400x200.png?text=CATP+News';
      if (values.uploadAnh && values.uploadAnh.length > 0) {
        // Lấy tên file gốc (Giả sử bạn đã có thư mục uploads ở backend)
        tenFileAnh = `http://localhost:3000/uploads/${values.uploadAnh[0].name}`;
      } else if (editingNews?.hinhAnh) {
        tenFileAnh = editingNews.hinhAnh; // Nếu đang sửa mà ko up ảnh mới thì giữ nguyên ảnh cũ
      }

      const method = editingNews ? 'PATCH' : 'POST';
      const url = editingNews 
        ? `http://localhost:3000/news/${editingNews.id}` 
        : 'http://localhost:3000/news';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tieuDe: values.tieuDe,
          noiDung: values.noiDung,
          hinhAnh: tenFileAnh, 
          tacGia: values.tacGia || 'Ban Tiếp nhận CATP',
        }),
      });

      if (response.ok) {
        message.success(editingNews ? 'Cập nhật bài viết thành công!' : 'Đăng bài viết mới thành công!');
        setIsModalVisible(false);
        form.resetFields();
        setEditingNews(null);
        fetchNews(); 
      } else {
        message.error('Lỗi khi lưu bài viết!');
      }
    } catch (error) {
      message.error('Không thể kết nối đến máy chủ!');
    }
  };

  // 3. HÀM XỬ LÝ XÓA BÀI VIẾT
  const handleDeleteNews = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/news/${id}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Đã xóa bài viết!');
        fetchNews();
      } else {
        message.error('Lỗi khi xóa bài viết!');
      }
    } catch (error) {
      message.error('Lỗi kết nối khi xóa!');
    }
  };

  // 4. HÀM MỞ MODAL SỬA
  const openEditModal = (newsItem) => {
    setEditingNews(newsItem);
    form.setFieldsValue({
      tieuDe: newsItem.tieuDe,
      tacGia: newsItem.tacGia,
      noiDung: newsItem.noiDung,
      // Không load lại ảnh vào ô Upload để tránh lỗi, người dùng có thể up ảnh mới đè lên
    });
    setIsModalVisible(true);
  };

  // 5. HÀM MỞ MODAL XEM CHI TIẾT
  const openViewModal = (newsItem) => {
    setViewingNews(newsItem);
    setIsViewModalVisible(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <ReadOutlined style={{ marginRight: '10px', color: '#3b82f6' }} />
            Tuyên truyền & Cảnh báo
          </Title>
          <Text type="secondary">Cập nhật tin tức an ninh trật tự, tuyên truyền pháp luật cho học sinh.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => {
            setEditingNews(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          style={{ backgroundColor: '#10b981', border: 'none' }}
        >
          Đăng tin mới
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {newsList?.map((item) => (
          <Col xs={24} sm={12} md={8} lg={8} key={item.id}>
            <Card
              hoverable
              cover={<img alt={item.tieuDe} src={item.hinhAnh} style={{ height: '200px', objectFit: 'cover' }} />}
              style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden' }}
              bodyStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
              // THANH CÔNG CỤ XEM - SỬA - XÓA Ở ĐÁY CARD
              actions={[
                <EyeOutlined key="view" onClick={() => openViewModal(item)} style={{ color: '#1890ff' }} />,
                <EditOutlined key="edit" onClick={() => openEditModal(item)} style={{ color: '#faad14' }} />,
                <Popconfirm 
                  title="Bạn có chắc chắn muốn xóa tin này?" 
                  onConfirm={() => handleDeleteNews(item.id)}
                  okText="Xóa" cancelText="Hủy"
                >
                  <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                </Popconfirm>,
              ]}
            >
              <div style={{ marginBottom: '12px' }}><Tag color="blue">Tin tức</Tag></div>
              <Title level={5} style={{ marginBottom: '8px', flexGrow: 0 }}>{item.tieuDe}</Title>
              <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ flexGrow: 1 }}>{item.noiDung}</Paragraph>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8c8c8c' }}>
                <span><ClockCircleOutlined /> {item.ngayDang ? new Date(item.ngayDang).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</span>
                <span><UserOutlined /> {item.tacGia}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MODAL THÊM / SỬA BÀI VIẾT */}
      <Modal
        title={<Title level={4}>{editingNews ? 'Cập nhật bài viết' : 'Đăng bài tuyên truyền mới'}</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText={editingNews ? 'Lưu thay đổi' : 'Đăng bài'}
        cancelText="Hủy"
        width={700}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSaveNews}>
          <Form.Item name="tieuDe" label="Tiêu đề bài viết" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
            <Input placeholder="Nhập tiêu đề hấp dẫn..." size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tacGia" label="Cơ quan / Tác giả đăng bài">
                <Input placeholder="VD: Phòng CSGT CATP Huế" />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* NÚT UPLOAD ẢNH XỊN XÒ */}
              <Form.Item 
                name="uploadAnh" 
                label="Tải ảnh lên (Tùy chọn)" 
                valuePropName="fileList" 
                getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
              >
                <Upload beforeUpload={() => false} maxCount={1} listType="picture" accept="image/*">
                  <Button icon={<UploadOutlined />}>Chọn ảnh từ máy</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="noiDung" label="Nội dung chi tiết" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
            <TextArea rows={6} placeholder="Nhập nội dung bài tuyên truyền..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL XEM CHI TIẾT BÀI VIẾT DÀNH CHO NGƯỜI ĐỌC */}
      <Modal
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[<Button key="close" type="primary" onClick={() => setIsViewModalVisible(false)}>Đóng</Button>]}
        width={800}
        centered
      >
        {viewingNews && (
          <div>
            <Title level={3}>{viewingNews.tieuDe}</Title>
            <div style={{ marginBottom: '20px', color: '#8c8c8c' }}>
              <Space size="large">
                <span><UserOutlined /> Đăng bởi: {viewingNews.tacGia}</span>
                <span><ClockCircleOutlined /> Thời gian: {viewingNews.ngayDang ? new Date(viewingNews.ngayDang).toLocaleDateString('vi-VN') : ''}</span>
              </Space>
            </div>
            <img 
              src={viewingNews.hinhAnh} 
              alt="Ảnh minh họa" 
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} 
            />
            {/* Thuộc tính whiteSpace giúp giữ nguyên các dòng xuống hàng (Enter) khi Admin gõ */}
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {viewingNews.noiDung}
            </Paragraph>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default PublicAwareness;