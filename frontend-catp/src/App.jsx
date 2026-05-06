// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// 👉 ĐÃ THÊM: Import Upload, IdcardOutlined và UploadOutlined
import { Button, Dropdown, Avatar, Modal, Form, Input, message, Upload } from 'antd'; 
import { UserOutlined, LockOutlined, LogoutOutlined, IdcardOutlined, UploadOutlined } from '@ant-design/icons';
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
  
  // Lấy dữ liệu user từ Local Storage (có kèm avatar và tên nếu đã lưu)
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('catp_user')) || { email: 'Đang tải...' });

  // States quản lý 2 Modal (Đổi pass và Hồ sơ)
  const [isChangePassModalVisible, setIsChangePassModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  
  const [passForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  
  // State lưu ảnh Avatar tạm thời lúc đang chọn
  const [previewAvatar, setPreviewAvatar] = useState(userInfo?.avatar || null);

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

  const handleChangePassword = (values) => {
    message.info("Giao diện đổi mật khẩu đã xong! Chờ nối API Backend.");
    setIsChangePassModalVisible(false);
    passForm.resetFields();
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

  if (!userRole) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
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
  );
}

export default App;