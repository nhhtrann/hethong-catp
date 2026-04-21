import { useState } from 'react';
import './App.css';

// Import các Component từ file khác
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TiepNhanDieuPhoi from './pages/TiepNhanDieuPhoi';

const MainContent = ({ activeMenu }) => {
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'tiep-nhan':
        return <TiepNhanDieuPhoi />;
      case 'don-vi':
        return <div className="card-tam"><h3>Danh sách Đơn vị phối hợp</h3></div>;
      case 'bao-cao':
        return <div className="card-tam"><h3>Xuất báo cáo tự động</h3></div>;
      case 'tuyen-truyen':
        return <div className="card-tam"><h3>Quản lý Bài viết Tuyên truyền</h3></div>;
      default:
        return <p>Đang tải...</p>;
    }
  };

  return (
    <div className="main-content">
      <header className="top-header">
        <h1>Hệ thống Tiếp nhận Phản ánh và Tuyên truyền</h1>
        <div className="header-right">
          <span className="notification" title="Thông báo Real-time">🔔 (3)</span>
          <span className="user-profile">👋 Xin chào, Admin</span>
        </div>
      </header>
      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
};

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  return (
    <div className="app-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <MainContent activeMenu={activeMenu} />
    </div>
  );
}

export default App;