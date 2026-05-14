// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Tag, Typography } from 'antd'; 
import { useNavigate, useLocation } from 'react-router-dom';

import {
  DashboardOutlined, InboxOutlined, FileTextOutlined,
  BankOutlined, BarChartOutlined, NotificationOutlined,
  MenuOutlined
} from '@ant-design/icons';

import logoMobi from '../uploads/logo.jpg'; 

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const sidebarRef = useRef(null); 
  
  const navigate = useNavigate(); 
  const location = useLocation(); 

  const allMenus = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan', roles: ['admin'] },
    { key: '/tiep-nhan', icon: <InboxOutlined />, label: 'Tiếp nhận & Điều phối', roles: ['admin'] },
    { key: '/bao-cao-ket-qua', icon: <FileTextOutlined />, label: 'Nhiệm vụ & Báo cáo', roles: ['unit'] },
    { key: '/don-vi', icon: <BankOutlined />, label: 'Quản lý Đơn vị', roles: ['admin'] },
    { key: '/bao-cao', icon: <BarChartOutlined />, label: 'Báo cáo & Thống kê', roles: ['admin'] },
    { key: '/tuyen-truyen', icon: <NotificationOutlined />, label: 'Tuyên truyền Pháp luật', roles: ['admin'] }
  ];

  const allowedMenus = allMenus.filter(menu => menu.roles.includes(role));

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 👉 ĐÃ SỬA: Chặn không cho tự đóng Sidebar khi click ra ngoài trên PC
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Chỉ khi đang là Mobile (isMobile = true) thì mới được phép tự động đóng
      if (isMobile && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setCollapsed(true); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]); // Phải có isMobile ở đây để React biết trạng thái màn hình

  return (
    <div ref={sidebarRef} style={{ zIndex: 1001 }}>
      {/* Nút Hamburger nổi cố định - CẢ PC VÀ MOBILE để mở khi Sider đang đóng */}
      <div
        onClick={() => setCollapsed(false)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 1000,
          display: collapsed ? 'flex' : 'none', 
          alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', width: '32px', height: '32px'
        }}
      >
        <MenuOutlined style={{ fontSize: '22px', color: '#005bac' }} />
      </div>

      <Sider 
        trigger={null} collapsible collapsed={collapsed} collapsedWidth={0} width={250}
        theme="light"
        style={{
          height: '100vh', position: isMobile ? 'fixed' : 'relative', left: 0, top: 0, zIndex: 1001,
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.08)', transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* 👉 ĐÃ SỬA: Ép chữ không rớt dòng và cân chỉnh lại lề */}
          {!collapsed && (
            <div style={{
              height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
              padding: '0 16px', // Giảm padding xuống một chút để nhường chỗ cho chữ
              background: '#ffffff', borderBottom: '1px solid #f0f0f0',
              overflow: 'hidden' // Tránh tràn giao diện
            }}>
              <MenuOutlined 
                style={{ fontSize: '20px', color: '#005bac', marginRight: '12px', cursor: 'pointer' }} 
                onClick={() => setCollapsed(true)}
              />
              {/* Thêm whiteSpace: 'nowrap' để CẤM chữ rớt dòng */}
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#005bac', whiteSpace: 'nowrap' }}>
                Hệ thống Quản lý CATP
              </span>
            </div>
          )}

          {/* KHU VỰC LOGO */}
          {!collapsed && (
            <div style={{ 
              height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 12px', background: '#ffffff', borderBottom: '1px solid #f0f0f0'
            }}>
                <img src={logoMobi} alt="MobiFone Logo" style={{ width: '90%', maxHeight: '54px', objectFit: 'contain' }} />
            </div>
          )}

          {/* QUYỀN HẠN TAG */}
          {!collapsed && (
            <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '8px' }}>
              <Tag color={role === 'admin' ? '#005bac' : '#10b981'} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '12px', border: 'none' }}>
                {role === 'admin' ? 'Admin CATP' : 'Đơn vị xử lý'}
              </Tag>
            </div>
          )}

          {/* THANH MENU */}
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]} 
            onClick={({ key }) => { navigate(key); if (isMobile) setCollapsed(true); }} 
            items={allowedMenus.map(item => ({ ...item, style: { textAlign: 'left', fontWeight: location.pathname === item.key ? '600' : 'normal' } }))} 
            style={{ marginTop: '8px', borderRight: 0, flex: 1 }} 
          />
        </div>

        {/* Chân trang Sider */}
        {!collapsed && (
          <div style={{
            padding: '20px',
            background: '#f9f9f9', 
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13px',
            color: '#595959',
          }}>
            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>Phiên bản 1.0.0</Text>
            <Text type="secondary" style={{ fontWeight: '500' }}>Hệ thống Quản lý CATP</Text>
          </div>
        )}
      </Sider>
    </div>
  );
};

export default Sidebar;