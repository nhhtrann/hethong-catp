// src/pages/Dashboard.jsx

const Dashboard = () => {
  const duLieuPhanAnh = [
    { id: 1, mang: "An toàn Giao thông", tongSo: 150, daXuLy: 120, mauSac: "#3b82f6" },
    { id: 2, mang: "Tội phạm Ma túy", tongSo: 45, daXuLy: 38, mauSac: "#ef4444" },
    { id: 3, mang: "Bạo lực học đường", tongSo: 60, daXuLy: 30, mauSac: "#f59e0b" },
    { id: 4, mang: "An ninh Trật tự", tongSo: 85, daXuLy: 80, mauSac: "#10b981" }
  ];

  const tongVuViec = duLieuPhanAnh.reduce((tong, item) => tong + item.tongSo, 0);
  const tongDaXuLy = duLieuPhanAnh.reduce((tong, item) => tong + item.daXuLy, 0);
  const tyLeChung = Math.round((tongDaXuLy / tongVuViec) * 100);

  return (
    <div className="dashboard-container">
      <div className="stats-row">
        <div className="stat-card"><div className="stat-title">Tổng số phản ánh</div><div className="stat-value">{tongVuViec}</div></div>
        <div className="stat-card"><div className="stat-title">Đã giải quyết</div><div className="stat-value text-success">{tongDaXuLy}</div></div>
        <div className="stat-card"><div className="stat-title">Tỷ lệ hoàn thành</div><div className="stat-value text-primary">{tyLeChung}%</div></div>
      </div>
      <div className="chart-card">
        <h3>📊 Tỷ lệ xử lý theo Mảng phản ánh</h3>
        <div className="bar-chart-container">
          {duLieuPhanAnh.map((item) => {
            const tyLe = Math.round((item.daXuLy / item.tongSo) * 100);
            return (
              <div key={item.id} className="bar-item">
                <div className="bar-label"><span>{item.mang}</span><span>{item.daXuLy} / {item.tongSo} ({tyLe}%)</span></div>
                <div className="progress-bg"><div className="progress-fill" style={{ width: `${tyLe}%`, backgroundColor: item.mauSac }}></div></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;