// src/pages/PublicAwareness.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Typography, Row, Col, message, Tag, Upload, Popconfirm, Space } from 'antd';
import { 
  PlusOutlined, ReadOutlined, ClockCircleOutlined, UserOutlined, 
  UploadOutlined, EditOutlined, DeleteOutlined, EyeOutlined 
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const DEFAULT_IMAGE = "https://placehold.co/600x400/e2e8f0/475569?text=Tuyen+Truyen+CATP";

const PublicAwareness = () => {
  const [newsList, setNewsList] = useState([]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState(null); 
  const [form] = Form.useForm();

  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingNews, setViewingNews] = useState(null);

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

  // 🟢 HÀM XỬ LÝ ẢNH BẰNG "KÉT SẮT" TRÌNH DUYỆT (100% Chống sập Server)
  const processImageToLocal = (file) => {
    return new Promise((resolve) => {
      if (!(file instanceof Blob)) return resolve(DEFAULT_IMAGE);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; // Giữ độ nét ổn định
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Nén ảnh gọn nhẹ
          const base64Data = canvas.toDataURL('image/jpeg', 0.6);
          resolve(base64Data);
        };
        img.onerror = () => resolve(DEFAULT_IMAGE);
      };
      reader.onerror = () => resolve(DEFAULT_IMAGE);
    });
  };

  // 🟢 HÀM HIỂN THỊ ẢNH TỪ KÉT SẮT
  const getImageSrc = (url) => {
    if (!url) return DEFAULT_IMAGE;
    if (url.startsWith('local_img_')) {
      return localStorage.getItem(url) || DEFAULT_IMAGE;
    }
    return url;
  };

  const handleSaveNews = async (values) => {
    try {
      let finalImageUrl = DEFAULT_IMAGE;

      if (values.uploadAnh && values.uploadAnh.length > 0) {
        const fileObj = values.uploadAnh[0].originFileObj || values.uploadAnh[0];
        const base64Data = await processImageToLocal(fileObj);
        
        // 🟢 LƯU ẢNH VÀO KÉT SẮT VÀ TẠO CHÌA KHÓA
        const imageKey = 'local_img_' + Date.now();
        localStorage.setItem(imageKey, base64Data);
        finalImageUrl = imageKey; // Gán chìa khóa siêu ngắn để lừa Server
        
      } else if (editingNews?.hinhAnh) {
        finalImageUrl = editingNews.hinhAnh; 
      }

      const method = editingNews ? 'PATCH' : 'POST';
      const url = editingNews 
        ? `http://localhost:3000/news/${editingNews.id}` 
        : 'http://localhost:3000/news';

      // Payload gửi đi lúc này chỉ nặng chưa tới 1KB, json-server duyệt 100%
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tieuDe: values.tieuDe,
          noiDung: values.noiDung,
          hinhAnh: finalImageUrl, 
          tacGia: values.tacGia || 'Ban Tiếp nhận CATP',
          ngayDang: editingNews ? editingNews.ngayDang : new Date().toISOString()
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

  const handleDeleteNews = async (item) => {
    try {
      const response = await fetch(`http://localhost:3000/news/${item.id}`, { method: 'DELETE' });
      if (response.ok) {
        // Nếu bài viết có lưu ảnh trong két sắt thì dọn dẹp luôn
        if (item.hinhAnh && item.hinhAnh.startsWith('local_img_')) {
          localStorage.removeItem(item.hinhAnh);
        }
        message.success('Đã xóa bài viết!');
        fetchNews();
      } else {
        message.error('Lỗi khi xóa bài viết!');
      }
    } catch (error) {
      message.error('Lỗi kết nối khi xóa!');
    }
  };

  const openEditModal = (newsItem) => {
    setEditingNews(newsItem);
    form.setFieldsValue({
      tieuDe: newsItem.tieuDe,
      tacGia: newsItem.tacGia,
      noiDung: newsItem.noiDung,
      uploadAnh: [] 
    });
    setIsModalVisible(true);
  };

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
          <Text type="secondary">Cập nhật tin tức an ninh trật tự, tuyên truyền pháp luật cho nhân dân.</Text>
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
          style={{ backgroundColor: '#10b981', border: 'none', fontWeight: 500 }}
        >
          Đăng tin mới
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {newsList?.map((item) => (
          <Col xs={24} sm={12} md={8} lg={8} key={item.id}>
            <Card
              hoverable
              cover={
                <img 
                  alt={item.tieuDe} 
                  src={getImageSrc(item.hinhAnh)} // 🟢 Dùng hàm giải mã Két sắt
                  onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                  style={{ height: '200px', objectFit: 'cover' }} 
                />
              }
              style={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden' }}
              bodyStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
              actions={[
                <EyeOutlined key="view" onClick={() => openViewModal(item)} style={{ color: '#1890ff' }} />,
                <EditOutlined key="edit" onClick={() => openEditModal(item)} style={{ color: '#faad14' }} />,
                <Popconfirm 
                  title="Bạn có chắc chắn muốn xóa tin này?" 
                  onConfirm={() => handleDeleteNews(item)}
                  okText="Xóa" cancelText="Hủy"
                >
                  <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                </Popconfirm>,
              ]}
            >
              <div style={{ marginBottom: '12px' }}><Tag color="blue" style={{ border: 'none' }}>Tin tức</Tag></div>
              <Title level={5} style={{ marginBottom: '8px', flexGrow: 0, fontWeight: 700, color: '#1f2937' }}>{item.tieuDe}</Title>
              <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ flexGrow: 1 }}>{item.noiDung}</Paragraph>
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8c8c8c' }}>
                <span><ClockCircleOutlined /> {item.ngayDang ? new Date(item.ngayDang).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</span>
                <span><UserOutlined /> {item.tacGia}</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

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

      <Modal
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[<Button key="close" type="primary" onClick={() => setIsViewModalVisible(false)}>Đóng</Button>]}
        width={800}
        centered
      >
        {viewingNews && (
          <div>
            <Title level={3} style={{ color: '#1f2937' }}>{viewingNews.tieuDe}</Title>
            <div style={{ marginBottom: '20px', color: '#64748b', fontWeight: 500 }}>
              <Space size="large">
                <span><UserOutlined /> Đăng bởi: {viewingNews.tacGia}</span>
                <span><ClockCircleOutlined /> Thời gian: {viewingNews.ngayDang ? new Date(viewingNews.ngayDang).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</span>
              </Space>
            </div>
            
            <img 
              src={getImageSrc(viewingNews.hinhAnh)} // 🟢 Dùng hàm giải mã Két sắt
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
              alt="Ảnh minh họa" 
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }} 
            />
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#334155' }}>
              {viewingNews.noiDung}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PublicAwareness;