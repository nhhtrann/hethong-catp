import React, { useState, useEffect } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Modal, Row, Col, Typography, Form, Select, Input, Upload, Button, message, Image } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const ReportDetail = ({ visible, onClose, data }) => {
  const [form] = Form.useForm();
  // ĐƯA STATE VÀ EFFECT VÀO TRONG COMPONENT
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/units')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUnits(data);
        }
      })
      .catch(err => console.error('Lỗi tải đơn vị:', err));
  }, []);

  useEffect(() => {
    if (data && visible) {
      form.setFieldsValue({
        trangThai: data.trangThai,
        ghiChu: data.ghiChu,
        anhKetQua: data.anhKetQua ? JSON.parse(data.anhKetQua).map(fileName => ({
          name: fileName,
          status: 'done',
          url: `http://localhost:3000/uploads/${fileName}`
        })) : [],
        donViXuLy: data.donViXuLy
      });
    }
  }, [data, visible, form]);

  const handleLuuBaoCao = async (values) => {
    if (!data?.id) {
      message.error("Không tìm thấy ID vụ việc!");
      return;
    }

    try {
      const fileNames = values.anhKetQua?.fileList?.map(f => f.name) || [];
      const response = await fetch(`http://localhost:3000/reports/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trangThai: values.trangThai,
          donViXuLy: values.donViXuLy || "",
          ghiChuKetQua: values.ghiChu || "",
          anhKetQua: JSON.stringify(fileNames)
        })
      });

      if (response.ok) {
        message.success('Cập nhật dữ liệu thành công!');
        onClose();
        setTimeout(() => window.location.reload(), 500);
      } else {
        const errorData = await response.json();
        message.error(`Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      message.error('Lỗi kết nối tới Backend!');
    }
  };

  if (!data) return null;

  return (
    <Modal
      title={<Title level={4}>Chi tiết vụ việc: {data.tieuDe}</Title>}
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      centered
    >
      <Row gutter={24}>
        <Col span={12} style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ paddingRight: '10px' }}>
            <p><Text strong>Thời gian:</Text> {data.ngayGui}</p>
            <p><Text strong>Tọa độ GPS:</Text> 16.4637° N, 107.5909° E</p>
            <p><Text strong>Nội dung chi tiết:</Text></p>
            <Paragraph style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
              {data.noiDung || "Chưa có nội dung mô tả."}
            </Paragraph>
            <p><Text strong>Ảnh minh chứng:</Text></p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {data.anhKetQua ? (
                JSON.parse(data.anhKetQua).map((tenFile, index) => (
                  <Image
                    key={index}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                    src={`http://localhost:3000/uploads/${tenFile}`}
                    fallback="https://via.placeholder.com/100?text=Error"
                  />
                ))
              ) : <Text type="secondary">Chưa có ảnh.</Text>}
            </div>
          </div>
        </Col>

        <Col span={12}>
          <div style={{ paddingLeft: '10px' }}>
            <Title level={5}>Cập nhật xử lý</Title>
            <Form form={form} layout="vertical" onFinish={handleLuuBaoCao}>
              <Form.Item name="trangThai" label="Trạng thái">
                <Select>
                  <Option value="Mới">Mới</Option>
                  <Option value="Đang xử lý">Đang xử lý</Option>
                  <Option value="Hoàn thành">Hoàn thành</Option>
                </Select>
              </Form.Item>

              <Form.Item name="donViXuLy" label="Phân công Đơn vị:">
                <Select placeholder="Chọn đơn vị">
                  {units.map(u => (
                    <Option key={u.id} value={u.tenDonVi}>{u.tenDonVi}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="ghiChu" label="Ghi chú kết quả" rules={[{ required: true, message: 'Nhập kết quả!' }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="anhKetQua" label="Ảnh minh chứng">
                <Dragger multiple beforeUpload={() => false}>
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Kéo thả ảnh vào đây</p>
                </Dragger>
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button onClick={onClose}>Hủy</Button>
                <Button type="primary" htmlType="submit" style={{ backgroundColor: '#10b981' }}>Lưu Báo Cáo</Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ReportDetail;