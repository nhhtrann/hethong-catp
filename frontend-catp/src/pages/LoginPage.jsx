import { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    // 👉 ĐÃ SỬA: Lưu toàn bộ data (có cả fullName và avatar) vào localStorage
    localStorage.setItem('catp_user', JSON.stringify(data)); 
    onLogin(data.role); // Gọi hàm handleLogin ở App.jsx
    message.success('Đăng nhập thành công!');
  } else {
    message.error(data.message);
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
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>🚓 BAN TN CATP</h2>
        <p>Hệ thống Tiếp nhận & Tuyên truyền</p>
        <input 
          type="text" placeholder="Tài khoản" 
          value={username} onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" placeholder="Mật khẩu" 
          value={password} onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="btn-primary">Đăng nhập</button>
      </form>
    </div>
  );
};

export default LoginPage;