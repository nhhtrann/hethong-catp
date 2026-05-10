// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

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
  
  const [userInfo, setUserInfo] = useState(() => {
  const saved = localStorage.getItem('catp_user');
  return saved ? JSON.parse(saved) : { email: 'Đang tải...', fullName: '', avatar: null };
});

  useEffect(() => {
  const saved = localStorage.getItem('catp_user');
  if (saved) {
    setUserInfo(JSON.parse(saved));
  }
}, [userRole]);

  const [isChangePassModalVisible, setIsChangePassModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  
  const [passForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  
  const [previewAvatar, setPreviewAvatar] = useState(userInfo?.avatar || null);

  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    setUserInfo(JSON.parse(localStorage.getItem('catp_user')));
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('catp_user');
  };

  const handleChangePassword = async (values) => {
    message.loading({ content: 'Đang xử lý...', key: 'changePass' });
    
    try {
      const res = await fetch('http://localhost:3000/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userInfo.email, 
          oldPass: values.oldPassword, 
          newPass: values.newPassword 
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        message.success({ content: data.message, key: 'changePass', duration: 3 });
        setIsChangePassModalVisible(false); 
        passForm.resetFields(); 
      } else {
        message.error({ content: data.message, key: 'changePass', duration: 3 });
      }
    } catch (err) {
      message.error({ content: 'Lỗi kết nối đến máy chủ!', key: 'changePass', duration: 3 });
    }
  };

  const handleAvatarChange = (info) => {
    if (info.fileList.length > 0) {
      const file = info.fileList[info.fileList.length - 1].originFileObj;
      const imageUrl = URL.createObjectURL(file);
      setPreviewAvatar(imageUrl);
    }
  };

  // 👉 ĐÃ SỬA: Gọi API để lưu Profile vào SQL
  const handleSaveProfile = async (values) => {
    message.loading({ content: 'Đang lưu hồ sơ...', key: 'updateProfile' });
    
    try {
      const response = await fetch('http://localhost:3000/Users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userInfo.email, // Dùng email để làm chìa khóa tìm user trong SQL
          fullName: values.fullName,
          avatar: previewAvatar // Chuỗi Base64 của ảnh
        })
      });

      const data = await response.json();

      if (data.success) {
        // Nếu SQL lưu thành công thì mới cập nhật lại giao diện và LocalStorage
        const updatedInfo = { ...userInfo, fullName: values.fullName, avatar: previewAvatar };
        setUserInfo(updatedInfo);
        localStorage.setItem('catp_user', JSON.stringify(updatedInfo));
        
        message.success({ content: "Đã cập nhật hồ sơ thành công!", key: 'updateProfile', duration: 3 });
        setIsProfileModalVisible(false);
      } else {
        message.error({ content: data.message || "Lỗi khi lưu hồ sơ!", key: 'updateProfile', duration: 3 });
      }
    } catch (error) {
      message.error({ content: "Không thể kết nối đến máy chủ!", key: 'updateProfile', duration: 3 });
    }
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <IdcardOutlined />,
        label: 'Hồ sơ cá nhân',
        onClick: () => {
          profileForm.setFieldsValue({
            email: userInfo.email,
            role: userRole === 'admin' ? 'Quản trị viên (Admin)' : 'Cán bộ Đơn vị',
            fullName: userInfo.fullName || ''
          });
          setPreviewAvatar(userInfo.avatar); 
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
      <div className="app-layout" style={{ display: 'flex', height: '100vh', width: '100%' }}>
        <Sidebar role={userRole} />
        
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 0 60px', height: '64px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Hệ thống Quản lý CATP</h1>
            
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                <Avatar 
                  size="large" 
                  src={userInfo?.avatar} 
                  icon={!userInfo?.avatar && <UserOutlined />} 
                  style={{ backgroundColor: '#1890ff', border: '2px solid #e6f7ff', objectFit: 'cover' }} 
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
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={() => false} 
            onChange={handleAvatarChange}
          >
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar 
                size={90} 
                src={previewAvatar} 
                icon={!previewAvatar && <UserOutlined />} 
                style={{ backgroundColor: '#bfbfbf', border: '3px solid #1890ff', marginBottom: '10px', objectFit: 'cover' }} 
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