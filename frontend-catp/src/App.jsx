// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button, ConfigProvider, Layout } from 'antd'; 
import { MenuFoldOutlined, MenuUnfoldOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons'; 
import './App.css';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ReportDispatch from './pages/ReportDispatch';
import UnitManagement from './pages/UnitManagement';
import StatisticalReport from './pages/StatisticalReport';
import PublicAwareness from './pages/PublicAwareness';
import LoginPage from './pages/LoginPage';
import ResultReport from './pages/ResultReport';

const { Header, Content } = Layout;

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [menuVisible, setMenuVisible] = useState(false); 
  const [desktopCollapsed, setDesktopCollapsed] = useState(false); 

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setMenuVisible(false); 
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  const toggleMenu = () => {
    if (isMobile) {
      setMenuVisible(true);
    } else {
      setDesktopCollapsed(!desktopCollapsed);
    }
  };

  if (!userRole) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const marginLeftValue = isMobile ? 0 : (desktopCollapsed ? 80 : 260);

  return (
    <ConfigProvider theme={{ components: { Table: { scroll: { x: 'max-content' } } } }}>
      <BrowserRouter>
        <Layout hasSider style={{ minHeight: '100vh' }}>
          
          <Sidebar 
            role={userRole} 
            isMobile={isMobile} 
            menuVisible={menuVisible} 
            setMenuVisible={setMenuVisible}
            desktopCollapsed={desktopCollapsed} 
          />
          
          <Layout 
            style={{ 
              marginLeft: marginLeftValue, 
              transition: 'margin-left 0.2s',
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '100vh'
            }}
          >
            <Header style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '0 16px', 
              background: '#fff', 
              boxShadow: '0 1px 4px rgba(0,21,41,.08)', 
              position: 'sticky', 
              top: 0,
              zIndex: 100 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Button 
                  type="text"
                  icon={isMobile ? <MenuOutlined /> : (desktopCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)} 
                  onClick={toggleMenu} 
                  style={{ fontSize: '18px', width: '40px', height: '40px' }}
                />

                <h1 style={{ 
                  margin: 0, 
                  fontSize: 'clamp(14px, 4vw, 18px)', 
                  fontWeight: '700',
                  color: '#1e293b', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? 'calc(100vw - 220px)' : 'none'
                }}>
                  Hệ thống Quản lý CATP
                </h1>
              </div>

              {/* 🟢 KHU VỰC THÔNG TIN TÀI KHOẢN VÀ ĐĂNG XUẤT */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
                
                {/* 🟢 ĐÃ FIX: Ép cứng height 32px bằng với nút Đăng xuất, chỉnh padding gọn gàng */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: userRole === 'admin' ? '#e6f7ff' : '#f6ffed',
                  border: userRole === 'admin' ? '1px solid #91d5ff' : '1px solid #b7eb8f',
                  padding: '0 12px',
                  height: '32px', // Cố định chiều cao
                  borderRadius: '6px'
                }}>
                  <UserOutlined style={{ color: userRole === 'admin' ? '#1890ff' : '#52c41a', fontSize: '14px' }} />
                  {!isMobile && (
                    <span style={{ 
                      fontWeight: 600, 
                      color: userRole === 'admin' ? '#096dd9' : '#389e0d',
                      fontSize: '14px',
                      lineHeight: 1
                    }}>
                      {userRole === 'admin' ? 'Quản trị viên' : 'Đơn vị xử lý'}
                    </span>
                  )}
                </div>

                <Button type="primary" danger onClick={handleLogout} style={{ borderRadius: '6px', fontWeight: 500, height: '32px' }}>
                  Đăng xuất
                </Button>
              </div>

            </Header>

            <Content style={{ margin: 0, background: '#f5f5f5', padding: '24px', flex: 1 }}>
              <div className="content-area">
                <Routes>
                  <Route path="/" element={userRole === 'admin' ? <Navigate to="/dashboard" replace /> : <Navigate to="/bao-cao-ket-qua" replace />} />
                  
                  {userRole === 'admin' && (
                    <>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tiep-nhan" element={<ReportDispatch />} />
                      <Route path="/don-vi" element={<UnitManagement />} />
                      <Route path="/bao-cao" element={<StatisticalReport />} />
                      <Route path="/tuyen-truyen" element={<PublicAwareness />} />
                    </>
                  )}

                  {userRole === 'unit' && (
                    <Route path="/bao-cao-ket-qua" element={<ResultReport />} />
                  )}

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;