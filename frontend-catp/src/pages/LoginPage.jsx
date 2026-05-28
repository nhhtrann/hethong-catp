// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, message, Modal } from 'antd'; 
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Link } = Typography;

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }), 
      });
      
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        localStorage.setItem('catp_user', JSON.stringify(data.user)); 
        if(onLogin) onLogin(data.user); 
        message.success({ content: 'Đăng nhập thành công!', key: 'login', duration: 3 });
        
        // ĐIỀU HƯỚNG PHÂN QUYỀN
        if (data.user.role === 'admin') {
          navigate('/dashboard'); 
        }
        else if (data.user.role === 'unit') {
          navigate('/bao-cao-ket-qua'); 
        } 
        else {
          navigate('/cong-khai'); 
        }
      } else {
        message.error({ content: data.message || 'Sai thông tin đăng nhập!', key: 'login', duration: 3 });
      }
    } catch (err) {
      setLoading(false);
      message.error({ content: 'Lỗi kết nối đến máy chủ!', key: 'login', duration: 3 });
    }
  };

  // === HÀM XỬ LÝ QUÊN MẬT KHẨU ===
  const handleRequestOtp = async (values) => {
    message.loading({ content: 'Đang kết nối trạm gửi Email...', key: 'forgot' });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.emailCuaToi }), 
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
    // 👉 ĐÃ SỬA: Dùng minHeight, width 100% và boxSizing để CHỐNG LỆCH FORM
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(135deg, #001529 0%, #062659 100%)', 
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      {/* 👉 ĐÃ SỬA: Tăng kích thước Card, bo góc to hơn, đổ bóng sâu để sang trọng hơn */}
      <Card 
        bordered={false} 
        style={{ 
          width: '100%', 
          maxWidth: '440px', // Mở rộng form ra một chút cho cân đối
          boxShadow: '0 15px 35px rgba(0,0,0,0.3)', // Đổ bóng sâu
          borderRadius: '16px', // Bo góc mềm mại
          padding: isMobile ? '20px 10px' : '30px 24px', // Thêm không gian thở
        }}
      >
        
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', marginBottom: '32px', textAlign: 'center' 
        }}>
          {/* 👉 ĐÃ SỬA: Typography chuẩn chỉn, màu sắc đồng bộ, khoảng cách thoáng */}
          <SafetyCertificateOutlined style={{ fontSize: '42px', color: '#005bac', marginBottom: '12px' }} />
          <Title level={2} style={{ margin: 0, fontSize: '26px', color: '#001529', fontWeight: 'bold' }}>
            ĐĂNG NHẬP
          </Title>
          <Paragraph 
            style={{ 
              fontSize: '14px', color: '#595959', 
              fontWeight: '500', marginTop: '8px', marginBottom: 0 
            }}
          >
            Hệ thống Tiếp nhận phản ánh &<br/>Tuyên truyền pháp luật
          </Paragraph>
        </div>

        <Form name="login_form" onFinish={handleFinish} layout="vertical" size="large">
          <Form.Item 
            name="email" 
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Nhập Email của bạn" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item 
            name="password" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]} 
            style={{ marginBottom: '16px' }}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Nhập mật khẩu" 
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <Link 
              style={{ fontSize: '14px', color: '#005bac', fontWeight: '500' }} 
              onClick={() => setIsForgotModalVisible(true)}
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block 
              style={{ 
                background: '#005bac', 
                border: 'none', 
                height: '46px', 
                fontSize: '16px', 
                fontWeight: 'bold', 
                borderRadius: '8px' 
              }}
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Modal Quên mật khẩu giữ nguyên logic, chỉ chỉnh xíu UI */}
      <Modal
        title={<span style={{ color: '#005bac', fontSize: '18px' }}><SafetyCertificateOutlined /> Khôi phục mật khẩu</span>}
        open={isForgotModalVisible}
        onCancel={() => { setIsForgotModalVisible(false); setForgotStep(1); forgotForm.resetFields(); }}
        footer={null} 
        centered
      >
        <Form form={forgotForm} layout="vertical" onFinish={forgotStep === 1 ? handleRequestOtp : handleResetPassword} size="large">
          {forgotStep === 1 ? (
            <>
              <p style={{ marginBottom: '20px', color: '#555' }}>Vui lòng nhập email đăng ký tài khoản. Hệ thống sẽ gửi mã xác thực (OTP) để bạn đặt lại mật khẩu mới.</p>
              <Form.Item name="emailCuaToi" rules={[{ required: true, message: 'Vui lòng nhập Email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập Email của bạn..." style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={{ background: '#005bac', height: '42px', borderRadius: '8px', fontWeight: 'bold' }}>
                Gửi mã xác thực
              </Button>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '20px', color: '#555' }}>Mã xác thực đã được gửi đến <b>{userEmail}</b>. Vui lòng kiểm tra hộp thư (kể cả mục Spam).</p>
              <Form.Item name="otpCode" rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}>
                <Input prefix={<SafetyCertificateOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập mã OTP (6 số)..." style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Form.Item name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }]}>
                <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập mật khẩu mới..." style={{ borderRadius: '8px' }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" block style={{ background: '#10b981', border: 'none', height: '42px', borderRadius: '8px', fontWeight: 'bold' }}>
                Xác nhận đổi mật khẩu
              </Button>
            </>
          )}
        </Form>
      </Modal>

    </div>
  );
};

export default LoginPage;