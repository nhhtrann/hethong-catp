// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TiepNhanDieuPhoi from './pages/TiepNhanDieuPhoi';
import QuanLyDonVi from './pages/QuanLyDonVi';
import BaoCaoThongKe from './pages/BaoCaoThongKe';
import TuyenTruyen from './pages/TuyenTruyen';
import LoginPage from './pages/LoginPage';
import BaoCaoKetQua from './pages/BaoCaoKetQua';

function App() {
  const [userRole, setUserRole] = useState(null); // null, 'admin', hoặc 'unit'

  // Nếu chưa đăng nhập, chỉ hiện trang Login
  if (!userRole) {
    return <LoginPage onLogin={(role) => setUserRole(role)} />;
  }

  return (
    // Bắt buộc phải có BrowserRouter bọc ngoài cùng
    <BrowserRouter>
      <div className="app-layout">
        {/* Sidebar không cần activeMenu nữa, chỉ cần truyền role */}
        <Sidebar role={userRole} />
        
        <div className="main-content">
          <header className="top-header">
            <h1>Hệ thống Quản lý CATP</h1>
            <button onClick={() => setUserRole(null)} className="btn-action">Đăng xuất</button>
          </header>
          
          <div className="content-area">
            {/* Đây là nơi phép thuật của React Router diễn ra */}
            <Routes>
              {/* Nếu gõ đường dẫn trống '/', tự động chuyển hướng về '/dashboard' */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Định nghĩa các đường link tương ứng với Component */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tiep-nhan" element={<TiepNhanDieuPhoi />} />
              <Route path="/bao-cao-ket-qua" element={<BaoCaoKetQua />} />
              <Route path="/don-vi" element={<QuanLyDonVi />} />
              <Route path="/bao-cao" element={<BaoCaoThongKe />} />
              <Route path="/tuyen-truyen" element={<TuyenTruyen />} />
              {/* <Route path="/login" element={<LoginPage onLogin={(role) => setUserRole(role)} />} /> 
              <Route path="/chi-tiet-phan-anh/:id" element={<ChiTietPhanAnh />} />*/}
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;