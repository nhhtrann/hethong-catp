// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'antd'; // ĐÃ THÊM: Import thư viện nút bấm của Ant Design
import './App.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ReportDispatch from './pages/ReportDispatch';
import UnitManagement from './pages/UnitManagement';
import StatisticalReport from './pages/StatisticalReport';
import PublicAwareness from './pages/PublicAwareness';
import LoginPage from './pages/LoginPage';
import ResultReport from './pages/ResultReport';


function App() {
  // Lấy role từ bộ nhớ trình duyệt, nếu không có thì mặc định là null
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

  // Hàm xử lý đăng nhập (Lưu vào State và Lưu vào Trình duyệt)
  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  // Hàm xử lý đăng xuất (Xóa khỏi State và Xóa khỏi Trình duyệt)
  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  // Nếu chưa đăng nhập, chỉ hiện trang Login
  if (!userRole) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    // Bắt buộc phải có BrowserRouter bọc ngoài cùng
    <BrowserRouter>
      <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* Sidebar không cần activeMenu nữa, chỉ cần truyền role */}
        <Sidebar role={userRole} />
        
        {/* Vùng nội dung chính, flex: 1 giúp nó tự động đẩy giãn ra chiếm hết phần màn hình còn lại */}
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Header đã được căn chỉnh flexbox để đẩy 2 bên, nền trắng */}
          <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Hệ thống Quản lý CATP</h1>
            {/* Nút Đăng xuất màu đỏ của Ant Design */}
            <Button type="primary" danger onClick={handleLogout}>
              Đăng xuất
            </Button>
          </header>

          {/* Thay thẻ Content bị lỗi bằng div. Chỉnh width 100% và flex 1 để ăn trọn màn hình */}
          <div style={{ padding: '24px', margin: 0, width: '100%', flex: 1, overflowY: 'auto', background: '#f5f5f5' }}>
            <div className="content-area">
              {/* Đây là nơi phép thuật của React Router diễn ra */}
              <Routes>
                {/* Nếu gõ đường dẫn trống '/', tự động chuyển hướng về '/dashboard' */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Định nghĩa các đường link tương ứng với Component */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tiep-nhan" element={<ReportDispatch />} />
                <Route path="/bao-cao-ket-qua" element={<ResultReport />} />
                <Route path="/don-vi" element={<UnitManagement />} />
                <Route path="/bao-cao" element={<StatisticalReport />} />
                <Route path="/tuyen-truyen" element={<PublicAwareness />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;