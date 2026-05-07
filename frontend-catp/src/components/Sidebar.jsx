// src/components/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Drawer } from 'antd'; 
import { 
  AppstoreOutlined, 
  MailOutlined, 
  InboxOutlined, 
  ProfileOutlined, 
  UsergroupAddOutlined, 
  AreaChartOutlined, 
  ReadOutlined,
  FileDoneOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = ({ role, isMobile, menuVisible, setMenuVisible, desktopCollapsed }) => {
  const navigate = useNavigate(); 
  const location = useLocation(); 

  const allMenus = [
    { key: '/dashboard', icon: <AppstoreOutlined style={{ fontSize: '18px' }} />, label: 'Tổng quan (Dashboard)', roles: ['admin'] },
    { key: '/tiep-nhan', icon: <InboxOutlined style={{ fontSize: '18px' }} />, label: 'Tiếp nhận & Điều phối', roles: ['admin'] },
    { key: '/bao-cao-ket-qua', icon: <FileDoneOutlined style={{ fontSize: '18px' }} />, label: 'Nhiệm vụ & Báo cáo', roles: ['unit'] },
    { key: '/don-vi', icon: <UsergroupAddOutlined style={{ fontSize: '18px' }} />, label: 'Quản lý Đơn vị', roles: ['admin'] },
    { key: '/bao-cao', icon: <AreaChartOutlined style={{ fontSize: '18px' }} />, label: 'Báo cáo & Thống kê', roles: ['admin'] },
    { key: '/tuyen-truyen', icon: <ReadOutlined style={{ fontSize: '18px' }} />, label: 'Tuyên truyền Pháp luật', roles: ['admin'] }
  ];

  const allowedMenus = allMenus.filter(menu => menu.roles.includes(role));

  const handleMenuClick = (e) => {
    navigate(e.key);
    if (isMobile) {
      setMenuVisible(false);
    }
  };

  const SidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      
      {/* 🟢 KHU VỰC LOGO ĐÃ ĐƯỢC LÀM SẠCH */}
      {!(desktopCollapsed && !isMobile) ? (
        <div style={{ padding: '24px 0 16px 0', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <img src="/logo.png" alt="MobiFone" style={{ width: '130px', marginBottom: '12px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>BAN TN CATP</Text>
          </div>
        </div>
      ) : (
        <div style={{ height: '48px', transition: 'all 0.2s' }}></div>
      )}
      
      {/* DANH SÁCH MENU */}
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={[location.pathname]} 
        items={allowedMenus} 
        onClick={handleMenuClick} 
        style={{ borderRight: 0, padding: desktopCollapsed && !isMobile ? '16px 0' : '16px 8px', flex: 1 }}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left" 
        width={260}
        open={menuVisible}
        onClose={() => setMenuVisible(false)} 
        styles={{ body: { padding: 0 } }} 
        closable={false} 
      >
        {SidebarContent}
      </Drawer>
    );
  }

  return (
    <Sider 
      width={260} 
      collapsedWidth={80} 
      collapsible 
      collapsed={desktopCollapsed} 
      trigger={null} 
      theme="light" 
      style={{ 
        overflow: 'auto', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        bottom: 0,
        zIndex: 101, 
        borderRight: '1px solid #f0f0f0' 
      }}
    >
      {SidebarContent}
    </Sider>
  );
};

export default Sidebar;