// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'antd'; 
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
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  if (!userRole) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* Truyền role xuống Sidebar để Sidebar biết đường mà giấu nút */}
        <Sidebar role={userRole} />
        
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Hệ thống Quản lý CATP</h1>
            <Button type="primary" danger onClick={handleLogout}>
              Đăng xuất
            </Button>
          </header>

          <div style={{ padding: '24px', margin: 0, width: '100%', flex: 1, overflowY: 'auto', background: '#f5f5f5' }}>
            <div className="content-area">
              <Routes>
                {/* 1. CHUYỂN HƯỚNG THÔNG MINH LÚC MỚI VÀO */}
                <Route path="/" element={
                  userRole === 'admin' 
                    ? <Navigate to="/dashboard" replace /> 
                    : <Navigate to="/bao-cao-ket-qua" replace />
                } />
                
                {/* 2. CÁC TRANG CHỈ ADMIN MỚI ĐƯỢC VÀO */}
                {userRole === 'admin' && (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tiep-nhan" element={<ReportDispatch />} />
                    <Route path="/don-vi" element={<UnitManagement />} />
                    <Route path="/bao-cao" element={<StatisticalReport />} />
                    <Route path="/tuyen-truyen" element={<PublicAwareness />} />
                  </>
                )}

                {/* 3. CÁC TRANG CHỈ ĐƠN VỊ XỬ LÝ MỚI ĐƯỢC VÀO */}
                {userRole === 'unit' && (
                  <Route path="/bao-cao-ket-qua" element={<ResultReport />} />
                )}

                {/* 4. CHẶN ĐƯỜNG DẪN BẬY BẠ: Gõ link lung tung sẽ bị đẩy về trang chủ của quyền đó */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;