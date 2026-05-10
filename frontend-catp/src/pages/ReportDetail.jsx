// src/components/ReportDetail.jsx
import React, { useState, useEffect } from 'react';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Modal, Row, Col, Typography, Form, Select, Input, Upload, Button, message, Image, Alert, Tag, Space } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ReportDetail = ({ visible, onClose, data, mode = 'admin' }) => {
  // 👉 LUÔN KHAI BÁO HOOKS Ở TRÊN CÙNG
  const [form] = Form.useForm();
  const [units, setUnits] = useState([]);
  const [previewResultImages, setPreviewResultImages] = useState([]);

  // Load danh sách đơn vị (Chạy 1 lần khi component mount)
  useEffect(() => {
    fetch('http://localhost:3000/units')
      .then(res => res.json())
      .then(result => Array.isArray(result) && setUnits(result))
      .catch(err => console.error("Lỗi load đơn vị:", err));
  }, []);

  // Sync dữ liệu mỗi khi mở Modal hoặc data thay đổi
  useEffect(() => {
    if (visible && data) {
      let images = [];
      // Parse JSON ảnh kết quả từ SQL an toàn
      if (data.anhKetQua && data.anhKetQua !== 'null' && data.anhKetQua !== '[]') {
        try {
          const parsed = JSON.parse(data.anhKetQua);
          images = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          images = [data.anhKetQua];
        }
      }
      setPreviewResultImages(images);

      form.setFieldsValue({
        trangThai: mode === 'unit' && data.trangThai !== 'Hoàn thành' && data.trangThai !== 'Chờ duyệt' 
                   ? 'Chờ duyệt' : data.trangThai,
        ghiChu: data.ghiChu || data.ghiChuKetQua || "",
        donViXuLy: data.donViXuLy
      });
    }
  }, [visible, data, form, mode]);

  // 👉 SAU KHI GỌI HOOKS MỚI ĐƯỢC KIỂM TRA ĐIỀU KIỆN RENDER
  if (!visible || !data) return null;

  const isCompleted = data?.trangThai === 'Hoàn thành';
  const isPending = data?.trangThai === 'Chờ duyệt';
  const disableUnit = mode === 'unit' || isCompleted;
  const disableResult = (mode === 'unit' && (isCompleted || isPending)) || (mode === 'admin' && isCompleted);
  const disableStatus = mode === 'unit' || isCompleted;
  const hideSaveBtn = (mode === 'unit' && (isCompleted || isPending)) || (mode === 'admin' && isCompleted);

  const handleBeforeUpload = async (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return Upload.LIST_IGNORE;
    }
    const base64 = await getBase64(file);
    setPreviewResultImages(prev => [...prev, base64]);
    return false;
  };

  const removeImage = (index) => {
setPreviewResultImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLuuBaoCao = async (values) => {
    try {
      const response = await fetch(`http://localhost:3000/reports/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trangThai: mode === 'unit' ? 'Chờ duyệt' : values.trangThai,
          donViXuLy: disableUnit ? data.donViXuLy : values.donViXuLy,
          ghiChuKetQua: disableResult ? (data.ghiChu || data.ghiChuKetQua) : values.ghiChu,
          anhKetQua: disableResult ? data.anhKetQua : JSON.stringify(previewResultImages)
        })
      });

      if (response.ok) {
        message.success('Cập nhật thành công!');
        onClose();
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      message.error('Lỗi kết nối máy chủ!');
    }
  };

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Chi tiết: {data?.tieuDe || "N/A"}</Title>}
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
      centered
    >
      {isCompleted && <Alert message="Hồ sơ đã hoàn thành, không thể sửa đổi." type="error" showIcon style={{ marginBottom: 16 }} />}
      
      <Row gutter={24}>
        <Col span={10} style={{ borderRight: '1px solid #f0f0f0' }}>
          <p><Text strong>Thời gian gửi:</Text> {data?.ngayGui || "N/A"}</p>
          <Text strong>Nội dung phản ánh:</Text>
          <Paragraph style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
            {data?.noiDung || "Không có nội dung mô tả."}
          </Paragraph>
          
          <Text strong>Ảnh minh chứng từ người dân:</Text>
          <div style={{ marginTop: 10 }}>
             {data?.anhKiemChung ? (
               <Image 
                width="100%" 
                src={data.anhKiemChung} 
                style={{ borderRadius: '8px', border: '1px solid #ddd', maxHeight: '300px', objectFit: 'contain' }}
                fallback="https://via.placeholder.com/200?text=Lỗi+ảnh" 
               />
             ) : (
               <div style={{ padding: '20px', background: '#f5f5f5', textAlign: 'center', borderRadius: '8px' }}>
                  <Text type="secondary">Người dân không gửi ảnh kèm theo</Text>
               </div>
             )}
          </div>
        </Col>

        <Col span={14}>
          <Form form={form} layout="vertical" onFinish={handleLuuBaoCao}>
            <Form.Item name="trangThai" label="Trạng thái xử lý">
              <Select disabled={disableStatus}>
                <Option value="Mới">Mới</Option>
                <Option value="Đang xử lý">Đang xử lý</Option>
                <Option value="Chờ duyệt">Chờ duyệt</Option>
                <Option value="Hoàn thành">Hoàn thành</Option>
              </Select>
            </Form.Item>
<Form.Item name="donViXuLy" label="Đơn vị được phân công">
              <Select disabled={disableUnit}>
                {units.map(u => <Option key={u.id} value={u.tenDonVi}>{u.tenDonVi}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="ghiChu" label="Ghi chú/Kết quả xử lý">
              <TextArea rows={3} disabled={disableResult} placeholder="Nhập nội dung báo cáo kết quả..." />
            </Form.Item>

            <Text strong>Hình ảnh minh chứng kết quả (Tải lên nhiều ảnh):</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
              {previewResultImages.map((img, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <Image
                    width={100}
                    height={100}
                    src={img}
                    style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #d9d9d9' }}
                  />
                  {!disableResult && (
                    <Button
                      type="primary"
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => removeImage(index)}
                      style={{ position: 'absolute', top: -8, right: -8, zIndex: 10, width: 22, height: 22, padding: 0 }}
                    />
                  )}
                </div>
              ))}

              {!disableResult && (
                <Upload
                  showUploadList={false}
                  beforeUpload={handleBeforeUpload}
                  accept="image/*"
                  multiple
                >
                  <div style={{ 
                    width: 100, height: 100, border: '1px dashed #d9d9d9', 
                    borderRadius: '8px', display: 'flex', flexDirection: 'column', 
                    justifyContent: 'center', alignItems: 'center', cursor: 'pointer', background: '#fafafa'
                  }}>
                    <PlusOutlined />
                    <div style={{ marginTop: 8, fontSize: '12px' }}>Thêm ảnh</div>
                  </div>
                </Upload>
              )}
            </div>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <Space>
                <Button onClick={onClose}>Đóng</Button>
                {!hideSaveBtn && (
                  <Button type="primary" htmlType="submit" style={{ background: '#10b981', borderColor: '#10b981' }}>
                    Lưu và Gửi báo cáo
                  </Button>
                )}
              </Space>
            </div>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

export default ReportDetail;