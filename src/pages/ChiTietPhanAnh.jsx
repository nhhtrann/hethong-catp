// src/components/ChiTietModal.jsx
import React from 'react';
import { Modal, Row, Col, Typography, Form, Select, Input, Upload, Button, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const ChiTietModal = ({ visible, onClose, data }) => {
  const [form] = Form.useForm();

  // Xử lý khi bấm nút "Lưu Báo Cáo"
  const handleLuuBaoCao = (values) => {
    console.log('Dữ liệu form gửi lên API:', values);
    message.success('Đã cập nhật báo cáo thành công!');
    onClose(); // Đóng modal
  };

  // Nếu chưa có dữ liệu thì không render gì cả
  if (!data) return null;

  return (
    <Modal
      title={<Title level={4}>Chi tiết vụ việc: {data.tieuDe}</Title>}
      open={visible}
      onCancel={onClose}
      width={900} // Modal rộng ra để chia 2 cột
      footer={null} // Tắt footer mặc định để tự custom nút
      centered
    >
      <Row gutter={24}>
        {/* NỬA BÊN TRÁI: THÔNG TIN HỌC SINH GỬI (Chỉ Đọc) */}
        <Col span={12} style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ paddingRight: '10px' }}>
            <p><Text strong>Thời gian:</Text> {data.ngayGui}</p>
            <p><Text strong>Tọa độ GPS:</Text> 16.4637° N, 107.5909° E</p>
            <p><Text strong>Nội dung chi tiết:</Text></p>
            <Paragraph style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              Vào lúc tan học có 2 học sinh xô xát ở cổng chính, có dấu hiệu mang theo vật cứng...
            </Paragraph>
            
            <p><Text strong>Ảnh minh chứng từ người gửi:</Text></p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* Ảnh giả lập */}
              <div style={{ width: 100, height: 100, backgroundColor: '#e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Ảnh 1</div>
              <div style={{ width: 100, height: 100, backgroundColor: '#e5e7eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Ảnh 2</div>
            </div>
          </div>
        </Col>

        {/* NỬA BÊN PHẢI: FORM CẬP NHẬT KẾT QUẢ (Cho phép Nhập) */}
        <Col span={12}>
          <div style={{ paddingLeft: '10px' }}>
            <Title level={5} style={{ marginTop: 0 }}>Cập nhật xử lý</Title>
            
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleLuuBaoCao}
              initialValues={{ trangThai: data.trangThai }} // Gắn trạng thái hiện tại vào Form
            >
              <Form.Item name="trangThai" label="Trạng thái vụ việc">
                <Select>
                  <Option value="Mới">Mới</Option>
                  <Option value="Đang xử lý">Đang xử lý</Option>
                  <Option value="Hoàn thành">Hoàn thành</Option>
                </Select>
              </Form.Item>

              <Form.Item name="ghiChu" label="Ghi chú kết quả thực hiện" rules={[{ required: true, message: 'Vui lòng nhập kết quả xử lý!' }]}>
                <TextArea rows={4} placeholder="Ví dụ: Đã mời phụ huynh lên làm việc..." />
              </Form.Item>

              <Form.Item name="anhKetQua" label="Tải lên ảnh minh chứng kết quả">
                <Dragger multiple={true} beforeUpload={() => false}>
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây</p>
                </Dragger>
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <Button onClick={onClose}>Hủy</Button>
                <Button type="primary" htmlType="submit" style={{ backgroundColor: '#10b981' }}>
                  Lưu Báo Cáo
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ChiTietModal;