// src/components/Sidebar.jsx

const Sidebar = ({ activeMenu, setActiveMenu, role }) => {
  // 1. Khai báo danh sách TẤT CẢ menu và Quyền được phép xem (roles)
  const allMenus = [
    { id: 'dashboard', icon: '📊', label: 'Tổng quan (Dashboard)', roles: ['admin', 'unit'] },
    { id: 'tiep-nhan', icon: '📩', label: 'Tiếp nhận & Điều phối', roles: ['admin', 'unit'] }, // Đơn vị cũng cần vào đây để báo cáo
    { id: 'bao-cao-ket-qua', icon: '📝', label: 'Nhiệm vụ & Báo cáo', roles: ['unit'] }, // MỚI THÊM: Dành riêng cho Đơn vị
    { id: 'don-vi', icon: '🏢', label: 'Quản lý Đơn vị phối hợp', roles: ['admin'] }, // Chỉ admin được thấy
    { id: 'bao-cao', icon: '📈', label: 'Báo cáo & Thống kê', roles: ['admin'] },    // Chỉ admin được thấy
    { id: 'tuyen-truyen', icon: '📰', label: 'Tuyên truyền Pháp luật', roles: ['admin'] } // Chỉ admin được thấy
  ];

  // 2. Bộ lọc thông minh: Chỉ giữ lại những menu mà quyền hiện tại (role) được phép
  const allowedMenus = allMenus.filter(menu => menu.roles.includes(role));

  return (
    <div className="sidebar">
      <div className="logo-area">
        <h2>🚓 BAN TN CATP</h2>
        {/* Đổi nhãn chức danh dựa theo role */}
        <span className="role-badge" style={{ backgroundColor: role === 'admin' ? '#2563eb' : '#10b981'}}>
          {role === 'admin' ? 'Admin' : 'Đơn vị xử lý'}
        </span>
      </div>
      
      <ul>
        {/* 3. Dùng mảng đã lọc (allowedMenus) để in ra thay vì in tất cả */}
        {allowedMenus.map((item) => (
          <li 
            key={item.id} 
            className={activeMenu === item.id ? 'active' : ''}
            onClick={() => setActiveMenu(item.id)}
          >
            <span className="icon">{item.icon}</span> {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;