// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const navigate = useNavigate(); // Hàm dùng để chuyển URL
  const location = useLocation(); // Hàm dùng để lấy URL hiện tại (để làm sáng menu)

  // 1. Khai báo danh sách TẤT CẢ menu với 'path' thay vì 'id'
  const allMenus = [
    { path: '/dashboard', icon: '📊', label: 'Tổng quan (Dashboard)', roles: ['admin', 'unit'] },
    { path: '/tiep-nhan', icon: '📩', label: 'Tiếp nhận & Điều phối', roles: ['admin', 'unit'] },
    { path: '/bao-cao-ket-qua', icon: '📝', label: 'Nhiệm vụ & Báo cáo', roles: ['unit'] },
    { path: '/don-vi', icon: '🏢', label: 'Quản lý Đơn vị', roles: ['admin'] },
    { path: '/bao-cao', icon: '📈', label: 'Báo cáo & Thống kê', roles: ['admin'] },
    { path: '/tuyen-truyen', icon: '📰', label: 'Tuyên truyền Pháp luật', roles: ['admin'] }
  ];

  // 2. Lọc menu theo quyền
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
            // Nếu URL hiện tại trùng với path của menu thì thêm class 'active'
            className={location.pathname === item.path ? 'active' : ''}
            // Dùng navigate để đổi URL trên trình duyệt
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