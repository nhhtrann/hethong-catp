// src/components/Sidebar.jsx

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Tổng quan (Dashboard)' },
    { id: 'tiep-nhan', icon: '📩', label: 'Tiếp nhận & Điều phối' },
    { id: 'don-vi', icon: '🏢', label: 'Quản lý Đơn vị phối hợp' },
    { id: 'bao-cao', icon: '📈', label: 'Báo cáo & Thống kê' },
    { id: 'tuyen-truyen', icon: '📰', label: 'Tuyên truyền Pháp luật' }
  ];

  return (
    <div className="sidebar">
      <div className="logo-area">
        <h2>🚓 BAN TN CATP</h2>
        <span className="role-badge">Admin</span>
      </div>
      <ul>
        {menuItems.map((item) => (
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

export default Sidebar; // Bắt buộc phải có để file khác gọi được