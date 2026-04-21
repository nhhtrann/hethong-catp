const BaoCaoThongKe = () => {
  return (
    <div className="dashboard-grid">
      <div className="card-tam">
        <h3>📊 Xuất Báo cáo Hiệu suất (Excel)</h3>
        <p>Báo cáo bao gồm danh sách các đơn vị phối hợp, số lượng vụ việc đã xử lý, đang xử lý và tỷ lệ hoàn thành trong tháng.</p>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <select style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option>Tháng 4 / 2026</option>
            <option>Tháng 3 / 2026</option>
          </select>
          <button className="btn-primary" style={{ backgroundColor: '#10b981' }}>
            📥 Tải xuống Excel (.xlsx)
          </button>
        </div>
      </div>

      <div className="card-tam">
        <h3>🖨️ Báo cáo Tuyên truyền</h3>
        <p>Thống kê số lượng bài viết tuyên truyền pháp luật và lượt tiếp cận của người dân.</p>
        <button className="btn-primary" style={{ marginTop: '20px', backgroundColor: '#6366f1' }}>
          📄 Xuất file PDF
        </button>
      </div>
    </div>
  );
};

export default BaoCaoThongKe;