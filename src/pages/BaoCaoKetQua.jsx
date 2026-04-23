// src/pages/BaoCaoKetQua.jsx
import React from 'react';
import { Card, Form, Select, Input, Button, Upload, Typography, message } from 'antd';
import { InboxOutlined, SendOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const BaoCaoKetQua = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    // values.hinhAnh sẽ chứa mảng các file đã upload
    console.log('Dữ liệu gửi đi:', values);
    message.success('Đã gửi báo cáo thành công lên Ban TN CATP!');
    form.resetFields(); // Làm sạch form
  };

  // Cấu hình cho khung Kéo thả
  const uploadProps = {
    name: 'file',
    multiple: true,
    action: 'https://run.mocky.io/v3/435e224c-4440-49c4-ad32-52468c6577b4', // Link test giả lập
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} tải lên thành công. [Tọa độ ghi nhận: Huế]`);
      } else if (status === 'error') {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Báo cáo Kết quả Xử lý vụ việc</Title>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          
          <Form.Item name="vuViec" label="Chọn vụ việc cần báo cáo:" rules={[{ required: true, message: 'Vui lòng chọn vụ việc!' }]}>
            <Select placeholder="-- Chọn vụ việc được giao --">
              <Option value="PA001">PA001 - Đua xe trái phép tại Lê Lợi</Option>
              <Option value="PA004">PA004 - Vượt đèn đỏ ngã 6</Option>
            </Select>
          </Form.Item>

          <Form.Item name="noidung" label="Nội dung xử lý & Số đối tượng liên quan:" rules={[{ required: true, message: 'Vui lòng nhập nội dung xử lý!' }]}>
            <TextArea rows={4} placeholder="Ví dụ: Đã tiến hành tạm giữ 2 phương tiện và lập biên bản..." />
          </Form.Item>

          <Form.Item name="hinhAnh" label="Tải lên ảnh minh chứng (Hỗ trợ Kéo/Thả):">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Kéo và thả ảnh vào đây hoặc click để chọn file</p>
              <p className="ant-upload-hint">Hệ thống sẽ tự động trích xuất định vị GPS từ ảnh.</p>
            </Dragger>
          </Form.Item>

          <Button type="primary" htmlType="submit" icon={<SendOutlined />} block size="large" style={{ marginTop: 10 }}>
            Gửi Báo Cáo Lên Ban TN CATP
          </Button>

        </Form>
      </Card>
    </div>
  );
};

export default BaoCaoKetQua;