// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  // 🟢 HÀM XỬ LÝ LOGIC ĐĂNG NHẬP (Đã giữ nguyên tài khoản/mật khẩu cũ của bạn)
  const onFinish = (values) => {
    setLoading(true);
    const { username, password } = values;

    // Giả lập thời gian chờ 0.5s cho có hiệu ứng loading xịn xò
    setTimeout(() => {
      if (username === 'admin' && password === '123') {
        message.success('Đăng nhập thành công với quyền Admin!');
        onLogin('admin');
      } else if (username === 'ca_quan' && password === '123') {
        message.success('Đăng nhập thành công với quyền Đơn vị!');
        onLogin('unit');
      } else {
        // Thông báo lỗi y như file cũ của bạn nhưng dùng popup xịn của Ant Design
        message.error('Sai tài khoản! (Thử: admin/123 hoặc ca_quan/123)');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      padding: '20px'
    }}>
      <Card 
        bordered={false}
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <SafetyCertificateOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          
          <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1f2937' }}>
            HỆ THỐNG QUẢN LÝ
          </Title>
          <Text style={{ color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>
            BAN TN CATP
          </Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Tài khoản (vd: admin hoặc ca_quan)" 
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} 
              placeholder="Mật khẩu (vd: 123)" 
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              style={{ 
                height: '44px', 
                borderRadius: '6px', 
                fontWeight: 600, 
                fontSize: '16px',
                background: '#1890ff'
              }}
            >
              ĐĂNG NHẬP
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            © 2026 Hệ thống Tiếp nhận & Tuyên truyền
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;