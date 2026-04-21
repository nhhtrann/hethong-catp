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
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Nếu chưa đăng nhập, chỉ hiện trang Login
  if (!userRole) {
    return <LoginPage onLogin={(role) => setUserRole(role)} />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar bây giờ nhận thêm userRole để ẩn/hiện menu */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} role={userRole} />
      
      <div className="main-content">
        <header className="top-header">
          <h1>Hệ thống Quản lý CATP</h1>
          <button onClick={() => setUserRole(null)} className="btn-action">Đăng xuất</button>
        </header>
        
        <div className="content-area">
          {/* Logic hiển thị nội dung dựa trên menu */}
          {activeMenu === 'dashboard' && <Dashboard />}
          {activeMenu === 'tiep-nhan' && <TiepNhanDieuPhoi />}
          {activeMenu === 'bao-cao-ket-qua' && <BaoCaoKetQua />} {/* MỚI THÊM: Dành riêng cho Đơn vị */}
          {activeMenu === 'don-vi' && <QuanLyDonVi />}
          {activeMenu === 'bao-cao' && <BaoCaoThongKe />}
          {activeMenu === 'tuyen-truyen' && <TuyenTruyen />}
        </div>
      </div>
    </div>
  );
}

export default App;