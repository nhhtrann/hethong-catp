import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Modal, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginPage = ({ onLogin }) => {
  // === CÁC BIẾN TRẠNG THÁI (STATE) ===
  const [loading, setLoading] = useState(false); // Biến xoay xoay của nút Đăng nhập
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); 
  const [userEmail, setUserEmail] = useState(''); 
  const [forgotForm] = Form.useForm();

  // === HÀM XỬ LÝ ĐĂNG NHẬP CHÍNH (GỌI API THẬT) ===
  const handleFinish = async (values) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, pass: values.password }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        message.success(`Đăng nhập thành công với quyền ${data.role === 'admin' ? 'Admin' : 'Đơn vị'}!`);
        
        // Lưu vào Local Storage
        localStorage.setItem('catp_user', JSON.stringify({ email: data.email, role: data.role }));
        
        onLogin(data.role); // Chuyển trang
      } else {
        message.error(data.message); // Hiển thị lỗi từ Backend gửi về
      }
    } catch (err) {
      setLoading(false);
      message.error('Lỗi kết nối đến máy chủ!');
    }
  };

  // === HÀM XỬ LÝ QUÊN MẬT KHẨU (BƯỚC 1: GỬI OTP) ===
  const handleRequestOtp = async (values) => {
    message.loading({ content: 'Đang kết nối trạm gửi Email...', key: 'forgot' });
    try {
      const res = await fetch('http://localhost:3000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.emailCuaToi }),
      });
      const data = await res.json();
      if (data.success) {
        message.success({ content: `Mã OTP đã gửi tới ${values.emailCuaToi}!`, key: 'forgot', duration: 3 });
        setUserEmail(values.emailCuaToi); // Lưu lại email để lát đổi pass
        setForgotStep(2); // Chuyển sang giao diện nhập OTP
      } else {
        message.error({ content: data.message, key: 'forgot', duration: 3 });
      }
    } catch (err) {
      message.error({ content: 'Lỗi kết nối đến máy chủ!', key: 'forgot', duration: 3 });
    }
  };

  // === HÀM XỬ LÝ QUÊN MẬT KHẨU (BƯỚC 2: XÁC NHẬN ĐỔI) ===
  const handleResetPassword = async (values) => {
    message.loading({ content: 'Đang xử lý...', key: 'reset' });
    try {
      const res = await fetch('http://localhost:3000/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          otp: values.otpCode, 
          newPass: values.newPassword 
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success({ content: 'Đổi mật khẩu thành công! Hãy đăng nhập lại.', key: 'reset', duration: 3 });
        setIsForgotModalVisible(false); // Đóng modal
        setForgotStep(1); // Reset lại bước 1 cho lần sau
        forgotForm.resetFields(); // Xóa trắng form
      } else {
        message.error({ content: data.message, key: 'reset', duration: 3 });
      }
    } catch (err) {
      message.error({ content: 'Lỗi hệ thống!', key: 'reset', duration: 3 });
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' 
    }}>
      
      {/* KHUNG ĐĂNG NHẬP CHÍNH */}
      <Card style={{ 
        width: 420, 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        padding: '10px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <SafetyCertificateOutlined style={{ fontSize: 50, color: '#1890ff', marginBottom: 10 }} />
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1f1f1f' }}>
            HỆ THỐNG CATP
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>Cổng đăng nhập nội bộ</Text>
        </div>

        <Form name="login_form" onFinish={handleFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Định dạng không hợp lệ!' }]}>
            <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Email đăng nhập..." style={{ borderRadius: '8px' }} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Mật khẩu..." style={{ borderRadius: '8px' }} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, marginTop: '-10px' }}>
            <a onClick={() => setIsForgotModalVisible(true)} style={{ color: '#1890ff', fontWeight: 500 }}>Quên mật khẩu?</a>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ height: '45px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, background: '#1890ff' }}>
              ĐĂNG NHẬP
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* MODAL QUÊN MẬT KHẨU (TỰ ĐỘNG CHUYỂN BƯỚC) */}
      <Modal
        title={<b>{forgotStep === 1 ? "Khôi phục mật khẩu" : "Thiết lập mật khẩu mới"}</b>}
        open={isForgotModalVisible}
        onCancel={() => { setIsForgotModalVisible(false); setForgotStep(1); forgotForm.resetFields(); }}
        footer={null}
        centered
        style={{ borderRadius: '12px', overflow: 'hidden' }}
      >
        <Form form={forgotForm} onFinish={forgotStep === 1 ? handleRequestOtp : handleResetPassword} layout="vertical" size="large">
          
          {forgotStep === 1 ? (
            // GIAO DIỆN BƯỚC 1
            <>
              <p style={{ color: '#595959', marginBottom: 20 }}>
                Vui lòng nhập địa chỉ Email của bạn. Chúng tôi sẽ gửi một mã xác thực (OTP) qua email này.
              </p>
              <Form.Item name="emailCuaToi" rules={[{ required: true, message: 'Vui lòng cung cấp Email!' }, { type: 'email', message: 'Email không đúng định dạng!' }]}>
                <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn..." style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={{ height: '45px', borderRadius: '8px', fontWeight: 600 }}>
                Nhận mã xác thực
              </Button>
            </>
          ) : (
            // GIAO DIỆN BƯỚC 2
            <>
              <p style={{ color: '#595959', marginBottom: 20 }}>
                Mã OTP đã được gửi tới hộp thư: <b>{userEmail}</b>
              </p>
              <Form.Item name="otpCode" label="Nhập mã OTP (6 số)" rules={[{ required: true, message: 'Vui lòng nhập OTP' }, { len: 6, message: 'Mã OTP phải có 6 chữ số' }]}>
                <Input placeholder="______" style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '18px', borderRadius: '8px' }} maxLength={6} />
              </Form.Item>
              <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới..." style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={{ height: '45px', borderRadius: '8px', fontWeight: 600, background: '#52c41a' }}>
                Xác nhận đổi mật khẩu
              </Button>
              <div style={{ textAlign: 'center', marginTop: 15 }}>
                <a onClick={() => setForgotStep(1)} style={{ color: '#8c8c8c' }}>Trở lại bước nhập Email</a>
              </div>
            </>
          )}

        </Form>
      </Modal>

    </div>
  );
};

export default LoginPage;