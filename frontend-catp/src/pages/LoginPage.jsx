// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Modal } from 'antd'; 
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Paragraph, Link } = Typography;

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // States cho Quên mật khẩu
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  const [forgotForm] = Form.useForm();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // === HÀM XỬ LÝ ĐĂNG NHẬP CHÍNH ===
  const handleFinish = async (values) => {
    setLoading(true);
    message.loading({ content: 'Đang xử lý đăng nhập...', key: 'login', duration: 0 });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, pass: values.password }), 
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        localStorage.setItem('catp_user', JSON.stringify(data)); 
        onLogin(data); 
        message.success({ content: 'Đăng nhập thành công!', key: 'login', duration: 3 });
      } else {
        message.error({ content: data.message || 'Sai thông tin đăng nhập!', key: 'login', duration: 3 });
      }
    } catch (err) {
      setLoading(false);
      message.error({ content: 'Lỗi kết nối đến máy chủ!', key: 'login', duration: 3 });
    }
  };

  // === HÀM XỬ LÝ QUÊN MẬT KHẨU (BƯỚC 1: GỬI OTP) ===
  const handleRequestOtp = async (values) => {
    message.loading({ content: 'Đang kết nối trạm gửi Email...', key: 'forgot' });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.emailCuaToi }), // Khớp với biến API của bạn
      });
      const data = await res.json();
      if (data.success) {
        message.success({ content: `Mã OTP đã gửi tới ${values.emailCuaToi}!`, key: 'forgot', duration: 3 });
        setUserEmail(values.emailCuaToi); 
        setForgotStep(2); 
      } else {
        message.error({ content: data.message || 'Lỗi gửi email', key: 'forgot', duration: 3 });
      }
    } catch (err) {
      message.error({ content: 'Lỗi kết nối đến máy chủ!', key: 'forgot', duration: 3 });
    }
  };

  // === HÀM XỬ LÝ QUÊN MẬT KHẨU (BƯỚC 2: XÁC NHẬN ĐỔI) ===
  const handleResetPassword = async (values) => {
    message.loading({ content: 'Đang xử lý...', key: 'reset' });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
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
        setIsForgotModalVisible(false); 
        setForgotStep(1); 
        forgotForm.resetFields(); 
      } else {
        message.error({ content: data.message || 'Lỗi xác nhận', key: 'reset', duration: 3 });
      }
    } catch (err) {
      message.error({ content: 'Lỗi hệ thống!', key: 'reset', duration: 3 });
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', width: '100vw',
      background: 'linear-gradient(135deg, #001529 0%, #001d6e 100%)', 
      overflow: 'hidden', padding: '20px'
    }}>
      
      <Card 
        bordered={false} 
        style={{ 
          width: isMobile ? '90%' : '400px', // 👉 ĐÃ SỬA: Bóp nhỏ lại 90% trên điện thoại cho thanh thoát
          maxWidth: '450px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
          borderRadius: '12px', 
          padding: isMobile ? '10px' : '24px 32px'
        }}
      >
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 24px)', color: '#005bac' }}>Đăng nhập</Title>
          <Paragraph 
            style={{ 
              fontSize: 'clamp(12px, 3vw, 14px)', color: '#005bac', 
              letterSpacing: '0.3px', fontWeight: '500', whiteSpace: 'nowrap', marginTop: '5px' 
            }}
          >
            Hệ thống Tiếp nhận phản ánh & Tuyên truyền pháp luật
          </Paragraph>
        </div>

        <Form name="login_form" onFinish={handleFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nhập Email đăng nhập..." />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]} style={{ marginBottom: '12px' }}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu..." />
          </Form.Item>

          {/* 👉 ĐÃ THÊM: Nút quên mật khẩu nằm lệch phải */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <Link 
              style={{ fontSize: '13px', color: '#005bac' }} 
              onClick={() => setIsForgotModalVisible(true)}
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ background: '#005bac', border: 'none' }}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 👉 ĐÃ THÊM: MODAL QUÊN MẬT KHẨU HOÀN CHỈNH */}
      <Modal
        title={<b style={{ color: '#005bac' }}><SafetyCertificateOutlined /> Khôi phục mật khẩu</b>}
        open={isForgotModalVisible}
        onCancel={() => { setIsForgotModalVisible(false); setForgotStep(1); forgotForm.resetFields(); }}
        footer={null} // Tắt footer mặc định để dùng nút của Form
        centered
      >
        <Form form={forgotForm} layout="vertical" onFinish={forgotStep === 1 ? handleRequestOtp : handleResetPassword} size="large">
          {forgotStep === 1 ? (
            <>
              <p style={{ marginBottom: '20px', color: '#555' }}>Vui lòng nhập email đăng ký tài khoản. Chúng tôi sẽ gửi một mã OTP gồm 6 chữ số để bạn đặt lại mật khẩu.</p>
              <Form.Item name="emailCuaToi" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                <Input prefix={<MailOutlined />} placeholder="Nhập Email của bạn..." />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={{ background: '#005bac' }}>Gửi mã OTP</Button>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '20px', color: '#555' }}>Mã OTP đã được gửi đến <b>{userEmail}</b>. Vui lòng kiểm tra hộp thư của bạn.</p>
              <Form.Item name="otpCode" rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}>
                <Input prefix={<SafetyCertificateOutlined />} placeholder="Nhập mã OTP (6 số)..." />
              </Form.Item>
              <Form.Item name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới..." />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={{ background: '#10b981', border: 'none' }}>Xác nhận đổi mật khẩu</Button>
            </>
          )}
        </Form>
      </Modal>

    </div>
  );
};

export default LoginPage;