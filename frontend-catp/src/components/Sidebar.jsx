// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const navigate = useNavigate(); 
  const location = useLocation(); 

  // ĐÃ SỬA: Phân quyền rạch ròi 100%. Admin có 5 trang, Đơn vị có đúng 1 trang.
  const allMenus = [
    { path: '/dashboard', icon: '📊', label: 'Tổng quan (Dashboard)', roles: ['admin'] },
    { path: '/tiep-nhan', icon: '📩', label: 'Tiếp nhận & Điều phối', roles: ['admin'] },
    { path: '/bao-cao-ket-qua', icon: '📝', label: 'Nhiệm vụ & Báo cáo', roles: ['unit'] },
    { path: '/don-vi', icon: '🏢', label: 'Quản lý Đơn vị', roles: ['admin'] },
    { path: '/bao-cao', icon: '📈', label: 'Báo cáo & Thống kê', roles: ['admin'] },
    { path: '/tuyen-truyen', icon: '📰', label: 'Tuyên truyền Pháp luật', roles: ['admin'] }
  ];

  const allowedMenus = allMenus.filter(menu => menu.roles.includes(role));

  return (
    <div className="sidebar">
      <div className="logo-area">
        <h2>🚓 BAN TN CATP</h2>
        <span className="role-badge" style={{ backgroundColor: role === 'admin' ? '#2563eb' : '#10b981'}}>
          {role === 'admin' ? 'Admin' : 'Đơn vị xử lý'}
        </span>
      </div>
      
      <ul>
        {allowedMenus.map((item) => (
          <li 
            key={item.path} 
            className={location.pathname === item.path ? 'active' : ''}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span> {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;