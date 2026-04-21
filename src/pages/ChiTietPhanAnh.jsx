import { useState } from 'react';

const ChiTietPhanAnh = ({ idPhanAnh, onBack }) => {
  // Giả lập lấy dữ liệu chi tiết của vụ việc dựa vào ID truyền vào
  const duLieu = {
    id: idPhanAnh,
    tieuDe: "Đua xe trái phép tại Lê Lợi",
    nguoiBao: "Nguyễn Văn X (090xxxx123)",
    thoiGian: "22:30 - 21/04/2026",
    noiDung: "Có khoảng 10 đối tượng thanh thiếu niên không đội mũ bảo hiểm, lạng lách đánh võng và rú ga ầm ĩ trên đường Lê Lợi, đoạn trước mặt trường Quốc Học.",
    toaDo: "16.4675° N, 107.5811° E (Đường Lê Lợi, TP Huế)",
    anhMinhChung: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80", // Ảnh minh họa xe máy
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=400&q=80"
    ]
  };

  const [donViNhan, setDonViNhan] = useState("");
  const [hanXuLy, setHanXuLy] = useState("");

  const handleDieuPhoi = () => {
    if (!donViNhan || !hanXuLy) {
      alert("Vui lòng chọn đơn vị và thời hạn xử lý!");
      return;
    }
    alert(`Đã giao vụ việc ${idPhanAnh} cho ${donViNhan}.\nHạn chót: ${hanXuLy}`);
    onBack(); // Quay lại bảng danh sách
  };

  return (
    <div className="chi-tiet-container">
      {/* Nút quay lại */}
      <button onClick={onBack} className="btn-back">
        ⬅ Quay lại danh sách
      </button>

      <div className="chi-tiet-grid">
        {/* CỘT TRÁI: THÔNG TIN & MINH CHỨNG */}
        <div className="card-tam left-col">
          <div className="chi-tiet-header">
            <h3>{duLieu.tieuDe}</h3>
            <span className="status-badge danger">Chưa xử lý</span>
          </div>
          
          <div className="info-list">
            <p><strong>Mã vụ việc:</strong> {duLieu.id}</p>
            <p><strong>Người phản ánh:</strong> {duLieu.nguoiBao}</p>
            <p><strong>Thời gian ghi nhận:</strong> {duLieu.thoiGian}</p>
            <p><strong>Nội dung:</strong> {duLieu.noiDung}</p>
            <p className="gps-text"><strong>📍 Tọa độ GPS:</strong> {duLieu.toaDo}</p>
          </div>

          <h4 style={{ marginTop: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            📸 Ảnh/Video Minh chứng (Gallery)
          </h4>
          <div className="gallery-grid">
            {duLieu.anhMinhChung.map((anh, index) => (
              <img key={index} src={anh} alt={`Minh chứng ${index + 1}`} className="gallery-img" />
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: KHU VỰC ĐIỀU PHỐI (DÀNH CHO ADMIN) */}
        <div className="card-tam right-col">
          <h3 style={{ marginTop: 0 }}>⚙️ Điều phối Xử lý</h3>
          
          <div className="form-group">
            <label>Giao cho Đơn vị phối hợp:</label>
            <select value={donViNhan} onChange={(e) => setDonViNhan(e.target.value)}>
              <option value="">-- Chọn đơn vị --</option>
              <option value="Công an TP Huế">Công an TP Huế</option>
              <option value="Công an Phường Phú Nhuận">Công an Phường Phú Nhuận</option>
              <option value="Đội CSGT Bến Thành">Đội CSGT Trật tự</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Thời hạn xử lý (Deadline):</label>
            <input 
              type="date" 
              value={hanXuLy} 
              onChange={(e) => setHanXuLy(e.target.value)} 
              className="input-date"
            />
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label>Chỉ đạo thêm (Tùy chọn):</label>
            <textarea rows="3" placeholder="Ghi chú thêm cho đơn vị xử lý..."></textarea>
          </div>

          <button onClick={handleDieuPhoi} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
            ✅ Giao việc & Lên lịch
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChiTietPhanAnh;