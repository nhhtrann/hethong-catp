// src/components/ChiTietModal.jsx
import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Modal, Row, Col, Typography, Form, Select, Input, Upload, Button, message, Image } from 'antd';
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const ChiTietModal = ({ visible, onClose, data }) => {
  const [form] = Form.useForm();
  // Lệnh ép Form phải tự động điền dữ liệu mỗi khi mở Modal
  React.useEffect(() => {
    if (data && visible) {
      form.setFieldsValue({
        trangThai: data.trangThai,
        ghiChu: data.ghiChu, // Đổ chữ từ Database vào ô TextBox
        anhKetQua: data.anhKetQua ? JSON.parse(data.anhKetQua).map(fileName => ({
          name: fileName,
          status: 'done',
          url: `http://localhost:3000/uploads/${fileName}`
        })) : []
      });
    }
  }, [data, visible, form]);


  // Xử lý khi bấm nút "Lưu Báo Cáo"
const handleLuuBaoCao = async (values) => {
  // Kiểm tra xem data.id có tồn tại không để tránh lỗi cập nhật nhầm
  if (!data?.id) {
    message.error("Không tìm thấy ID vụ việc!");
    return;
  }

  try {
    // Xử lý danh sách ảnh từ Ant Design Upload
    const fileNames = values.anhKetQua?.fileList?.map(f => f.name) || [];

    // Sử dụng await để đợi phản hồi từ Server
    const response = await fetch(`http://localhost:3000/reports/${data.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trangThai: values.trangThai,
        ghiChuKetQua: values.ghiChu || "",
        anhKetQua: JSON.stringify(fileNames) 
      })
    });

    if (response.ok) {
      message.success('Cập nhật dữ liệu vào SQL Server thành công!');
      onClose(); // Đóng Modal ngay lập tức
      
      // Tải lại trang để cập nhật bảng (localStorage đã giữ lại đăng nhập nên không lo)
      setTimeout(() => {
        window.location.reload();
      }, 500); 
    } else {
      const errorData = await response.json();
      message.error(`Lỗi từ Server: ${errorData.message || 'Không thể lưu'}`);
    }
  } catch (error) {
    console.error("Lỗi kết nối API:", error);
    message.error('Không thể kết nối tới Backend. Hãy kiểm tra xem NestJS đã chạy chưa!');
  }
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
              {data.noiDung || "Chưa có nội dung mô tả."}
            </Paragraph>
            
            <p><Text strong>Ảnh minh chứng từ người gửi:</Text></p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {data.anhKetQua ? (
              JSON.parse(data.anhKetQua).map((tenFile, index) => (
              <Image
                key={index}
                width={100}
                height={100}
                style={{ objectFit: 'cover', borderRadius: '8px' }}
                src={`http://localhost:3000/uploads/${tenFile}`}
                fallback="https://via.placeholder.com/100?text=Error" // Hiện ảnh lỗi nếu ko tìm thấy file
              />
            ))
          ) : (
            <Text type="secondary">Chưa có ảnh minh chứng.</Text>
        )}
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