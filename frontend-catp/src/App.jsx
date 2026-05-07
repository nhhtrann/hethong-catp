// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Button, ConfigProvider, Layout } from 'antd'; 
import { MenuFoldOutlined, MenuUnfoldOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons'; 
=======

// 👉 ĐÃ THÊM: Import Upload, IdcardOutlined và UploadOutlined
import { Button, Dropdown, Avatar, Modal, Form, Input, message, Upload } from 'antd'; 
import { UserOutlined, LockOutlined, LogoutOutlined, IdcardOutlined, UploadOutlined } from '@ant-design/icons';
>>>>>>> 7ca7f08279c7547bee1ce4cc30aff4bdc8387904
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
  
<<<<<<< HEAD
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
=======
  // Lấy dữ liệu user từ Local Storage (có kèm avatar và tên nếu đã lưu)
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('catp_user')) || { email: 'Đang tải...' });

  // States quản lý 2 Modal (Đổi pass và Hồ sơ)
  const [isChangePassModalVisible, setIsChangePassModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  
  const [passForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  
  // State lưu ảnh Avatar tạm thời lúc đang chọn
  const [previewAvatar, setPreviewAvatar] = useState(userInfo?.avatar || null);
>>>>>>> 7ca7f08279c7547bee1ce4cc30aff4bdc8387904

  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    // Cập nhật lại userInfo sau khi login
    setUserInfo(JSON.parse(localStorage.getItem('catp_user')));
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('catp_user');
  };

  // 👉 ĐÃ SỬA: HÀM XỬ LÝ ĐỔI MẬT KHẨU GỌI API THẬT
  const handleChangePassword = async (values) => {
    message.loading({ content: 'Đang xử lý...', key: 'changePass' });
    
    try {
      const res = await fetch('http://localhost:3000/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userInfo.email, // Lấy email của người đang đăng nhập
          oldPass: values.oldPassword, 
          newPass: values.newPassword 
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        message.success({ content: data.message, key: 'changePass', duration: 3 });
        setIsChangePassModalVisible(false); // Đóng Modal
        passForm.resetFields(); // Xóa trắng form để lần sau mở lên không bị dính chữ cũ
      } else {
        message.error({ content: data.message, key: 'changePass', duration: 3 });
      }
    } catch (err) {
      message.error({ content: 'Lỗi kết nối đến máy chủ!', key: 'changePass', duration: 3 });
    }
  };

  // 👉 HÀM XỬ LÝ KHI CHỌN ẢNH AVATAR
  const handleAvatarChange = (info) => {
    // Ép React không gọi API ngay mà chỉ tạo đường dẫn xem trước (Blob URL)
    if (info.fileList.length > 0) {
      const file = info.fileList[info.fileList.length - 1].originFileObj;
      const imageUrl = URL.createObjectURL(file);
      setPreviewAvatar(imageUrl);
    }
  };

  // 👉 HÀM LƯU HỒ SƠ
  const handleSaveProfile = (values) => {
    const updatedInfo = { ...userInfo, fullName: values.fullName, avatar: previewAvatar };
    
    // Lưu vào State và Local Storage
    setUserInfo(updatedInfo);
    localStorage.setItem('catp_user', JSON.stringify(updatedInfo));
    
    message.success("Đã cập nhật hồ sơ thành công!");
    setIsProfileModalVisible(false);
  };

  // Cấu trúc Menu Dropdown
  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <IdcardOutlined />,
        label: 'Hồ sơ cá nhân',
        onClick: () => {
          // Đổ dữ liệu vào Form khi mở Modal
          profileForm.setFieldsValue({
            email: userInfo.email,
            role: userRole === 'admin' ? 'Quản trị viên (Admin)' : 'Cán bộ Đơn vị',
            fullName: userInfo.fullName || ''
          });
          setPreviewAvatar(userInfo.avatar); // Reset lại ảnh xem trước về ảnh hiện tại
          setIsProfileModalVisible(true);
        },
      },
      {
        key: 'change-pass',
        icon: <LockOutlined />,
        label: 'Đổi mật khẩu',
        onClick: () => setIsChangePassModalVisible(true),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        danger: true,
        label: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
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
<<<<<<< HEAD
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
=======
    <BrowserRouter>
      <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <Sidebar role={userRole} />
        
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '64px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Hệ thống Quản lý CATP</h1>
            
            {/* AVATAR HEADER CẬP NHẬT ẢNH MỚI */}
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <Avatar 
                  size="large" 
                  src={userInfo?.avatar} // Lấy ảnh từ State
                  icon={!userInfo?.avatar && <UserOutlined />} 
                  style={{ backgroundColor: '#1890ff', border: '2px solid #e6f7ff' }} 
                />
                <span style={{ fontWeight: 500, display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                  <span>{userInfo?.fullName || (userRole === 'admin' ? 'Admin' : 'Cán bộ')}</span>
                  <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{userInfo?.email}</span>
                </span>
              </div>
            </Dropdown>
          </header>

          <div style={{ padding: '24px', margin: 0, width: '100%', flex: 1, overflowY: 'auto', background: '#f5f5f5' }}>
            <div className="content-area">
              <Routes>
                <Route path="/" element={
                  userRole === 'admin' 
                    ? <Navigate to="/dashboard" replace /> 
                    : <Navigate to="/bao-cao-ket-qua" replace />
                } />
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
          </div>
        </div>
      </div>

      {/* 👉 1. MODAL HỒ SƠ CÁ NHÂN */}
      <Modal
        title={<b><IdcardOutlined /> Hồ sơ cá nhân</b>}
        open={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        onOk={() => profileForm.submit()}
        okText="Lưu thay đổi"
        cancelText="Đóng"
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
          {/* COMPONENT UPLOAD ẢNH CỦA ANTD */}
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={() => false} // Chặn không cho tự động upload lên mạng
            onChange={handleAvatarChange}
          >
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar 
                size={90} 
                src={previewAvatar} 
                icon={!previewAvatar && <UserOutlined />} 
                style={{ backgroundColor: '#bfbfbf', border: '3px solid #1890ff', marginBottom: '10px' }} 
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Button size="small" icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </div>
          </Upload>
        </div>

        <Form form={profileForm} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item name="email" label="Email đăng nhập">
            <Input disabled style={{ backgroundColor: '#f5f5f5', color: '#595959' }} />
          </Form.Item>
          <Form.Item name="role" label="Chức vụ / Quyền hạn">
            <Input disabled style={{ backgroundColor: '#f5f5f5', color: '#595959' }} />
          </Form.Item>
          <Form.Item name="fullName" label="Tên hiển thị">
            <Input placeholder="Nhập tên hiển thị của bạn..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 👉 2. MODAL ĐỔI MẬT KHẨU */}
      <Modal
        title={<b><LockOutlined /> Đổi mật khẩu tài khoản</b>}
        open={isChangePassModalVisible}
        onCancel={() => { setIsChangePassModalVisible(false); passForm.resetFields(); }}
        onOk={() => passForm.submit()}
        okText="Cập nhật mật khẩu"
        cancelText="Hủy bỏ"
        centered
      >
        <Form form={passForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item name="oldPassword" label="Mật khẩu hiện tại" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}>
            <Input.Password placeholder="Nhập mật khẩu đang sử dụng..." />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }]}>
            <Input.Password placeholder="Nhập mật khẩu mới..." />
          </Form.Item>
          <Form.Item 
            name="confirmPassword" 
            label="Xác nhận mật khẩu mới" 
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới..." />
          </Form.Item>
        </Form>
      </Modal>

    </BrowserRouter>
>>>>>>> 7ca7f08279c7547bee1ce4cc30aff4bdc8387904
  );
}

export default App;