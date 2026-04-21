import { useState } from 'react';

const BaoCaoKetQua = () => {
  // 1. Khởi tạo State lưu trữ dữ liệu Form
  const [vuViec, setVuViec] = useState('');
  const [noidung, setNoidung] = useState('');
  const [hinhAnh, setHinhAnh] = useState([]); // Mảng chứa các file ảnh kéo thả vào

  // 2. Xử lý sự kiện KÉO THẢ (Drag & Drop)
  const handleDragOver = (e) => {
    e.preventDefault(); // Bắt buộc phải có để trình duyệt cho phép thả file
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // Lấy danh sách file người dùng vừa thả vào
    const files = Array.from(e.dataTransfer.files);
    
    // Tạo URL tạm thời để hiển thị ảnh preview và giả lập tọa độ GPS tại Huế
    const fileData = files.map(file => ({
      name: file.name,
      preview: URL.createObjectURL(file), // Tạo link ảo để xem trước ảnh
      gps: "16.4637° N, 107.5905° E"      // Giả lập trích xuất định vị EXIF
    }));

    // Thêm ảnh mới vào mảng ảnh cũ
    setHinhAnh(prev => [...prev, ...fileData]);
  };

  const xoaAnh = (index) => {
    // Lọc bỏ ảnh tại vị trí index được click
    setHinhAnh(prev => prev.filter((_, i) => i !== index));
  };

  // 3. Xử lý khi bấm nút Gửi Báo Cáo
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vuViec || !noidung || hinhAnh.length === 0) {
      alert("Vui lòng điền đủ thông tin và đính kèm ít nhất 1 ảnh minh chứng!");
      return;
    }
    alert(`Đã gửi báo cáo thành công!\nSố lượng ảnh đính kèm: ${hinhAnh.length}\nTọa độ ghi nhận: ${hinhAnh[0].gps}`);
    // Sau khi gửi thì làm sạch Form
    setVuViec(''); setNoidung(''); setHinhAnh([]);
  };

  return (
    <div className="card-tam" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="tiep-nhan-header">
        <h3>📝 Báo cáo Kết quả Xử lý vụ việc</h3>
      </div>

      <form onSubmit={handleSubmit} className="form-bao-cao">
        <div className="form-group">
          <label>Chọn vụ việc cần báo cáo:</label>
          <select value={vuViec} onChange={(e) => setVuViec(e.target.value)} required>
            <option value="">-- Chọn vụ việc được giao --</option>
            <option value="PA001">PA001 - Đua xe trái phép tại Lê Lợi</option>
            <option value="PA004">PA004 - Vượt đèn đỏ ngã 6</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nội dung xử lý & Số đối tượng liên quan:</label>
          <textarea 
            rows="4" 
            placeholder="Ví dụ: Đã tiến hành tạm giữ 2 phương tiện và lập biên bản..."
            value={noidung}
            onChange={(e) => setNoidung(e.target.value)}
            required
          ></textarea>
        </div>

        {/* KHU VỰC KÉO THẢ ẢNH */}
        <div className="form-group">
          <label>Tải lên ảnh minh chứng (Hỗ trợ Kéo/Thả):</label>
          <div 
            className="drop-zone" 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
          >
            <p>📥 Kéo và thả ảnh vào đây hoặc click để chọn file</p>
          </div>

          {/* HIỂN THỊ ẢNH XEM TRƯỚC (PREVIEW) */}
          {hinhAnh.length > 0 && (
            <div className="image-preview-container">
              {hinhAnh.map((anh, index) => (
                <div key={index} className="image-card">
                  <img src={anh.preview} alt="Minh chứng" />
                  <div className="image-info">
                    <span className="gps-tag">📍 {anh.gps}</span>
                    <button type="button" className="btn-delete" onClick={() => xoaAnh(index)}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
          🚀 Gửi Báo Cáo Lên Ban TN CATP
        </button>
      </form>
    </div>
  );
};

export default BaoCaoKetQua;