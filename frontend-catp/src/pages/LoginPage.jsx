import { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập logic đăng nhập đơn giản
    if (username === 'admin' && password === '123') {
      onLogin('admin');
    } else if (username === 'ca_quan' && password === '123') {
      onLogin('unit');
    } else {
      alert("Sai tài khoản! (Thử: admin/123 hoặc ca_quan/123)");
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