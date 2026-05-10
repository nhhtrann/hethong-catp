// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Tag } from 'antd'; 
import { useNavigate, useLocation } from 'react-router-dom';

import {
  DashboardOutlined, InboxOutlined, FileTextOutlined,
  BankOutlined, BarChartOutlined, NotificationOutlined,
  MenuOutlined
} from '@ant-design/icons';

import logoMobi from '../uploads/logo.jpg'; 

const { Sider } = Layout;

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setCollapsed(true); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={sidebarRef} style={{ zIndex: 1001 }}>
      <div
        onClick={() => setCollapsed(false)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 1000,
          display: collapsed ? 'flex' : 'none', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', width: '32px', height: '32px'
        }}
      >
        {/* 👉 ĐÃ SỬA: Icon menu đổi màu xanh MobiFone */}
        <MenuOutlined style={{ fontSize: '22px', color: '#005bac' }} />
      </div>

      <Sider 
        trigger={null} collapsible collapsed={collapsed} collapsedWidth={0} width={250}
        theme="light" // 👉 ĐÃ SỬA: Chuyển Sidebar sang màu Trắng
        style={{
          height: '100vh', position: isMobile ? 'fixed' : 'relative', left: 0, top: 0, zIndex: 1001,
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.08)', transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s'
        }}
      >
        {/* 👉 ĐÃ SỬA: Nền chỗ chứa Logo thành màu Trắng, có viền kẻ dưới xám nhạt */}
        <div style={{ 
          height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 12px', background: '#ffffff', borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed && (
            <img src={logoMobi} alt="MobiFone Logo" style={{ width: '90%', maxHeight: '54px', objectFit: 'contain' }} />
          )}
        </div>

        {!collapsed && (
          <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '8px' }}>
            <Tag color={role === 'admin' ? '#005bac' : '#10b981'} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '12px', border: 'none' }}>
              {role === 'admin' ? 'Admin CATP' : 'Đơn vị xử lý'}
            </Tag>
          </div>
        )}

        <Menu
          theme="light" // 👉 ĐÃ SỬA: Chuyển Menu sang màu Trắng, khi hover/active nó sẽ tự bắt màu Xanh từ ConfigProvider
          mode="inline"
          selectedKeys={[location.pathname]} 
          onClick={({ key }) => { navigate(key); if (isMobile) setCollapsed(true); }} 
          items={allowedMenus.map(item => ({ ...item, style: { textAlign: 'left', fontWeight: location.pathname === item.key ? '600' : 'normal' } }))} 
          style={{ marginTop: '8px', textAlign: 'left', borderRight: 0 }}
        />
      </Sider>
    </div>
  );
};

export default Sidebar;