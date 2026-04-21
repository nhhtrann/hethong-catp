import { useState } from 'react';
import ChiTietPhanAnh from './ChiTietPhanAnh'; // Import Component vừa tạo

const TiepNhanDieuPhoi = () => {
  const danhSachPhanAnh = [
    { id: "PA001", tieuDe: "Đua xe trái phép tại Lê Lợi", mang: "Giao thông", donVi: "CA TP. Huế", trangThai: "Chưa xử lý", ngay: "21/04/2026" },
    { id: "PA002", tieuDe: "Tụ tập hút cỏ mỹ gần trường ĐH Khoa học", mang: "Ma túy", donVi: "CA P. Phú Nhuận", trangThai: "Đang xử lý", ngay: "20/04/2026" },
    // ... (Giữ nguyên dữ liệu cũ của bạn)
  ];

  const [locMang, setLocMang] = useState("Tất cả");
  const [locTrangThai, setLocTrangThai] = useState("Tất cả");
  
  // STATE MỚI: Dùng để lưu trữ ID của vụ việc đang được chọn để xem chi tiết
  // Nếu null nghĩa là đang xem Bảng danh sách
  const [vuViecDangXem, setVuViecDangXem] = useState(null); 

  const duLieuHienThi = danhSachPhanAnh.filter((item) => {
    return (locMang === "Tất cả" || item.mang === locMang) && 
           (locTrangThai === "Tất cả" || item.trangThai === locTrangThai);
  });

  // LOGIC HIỂN THỊ CÓ ĐIỀU KIỆN
  // Nếu đang có vụ việc được chọn -> Render trang Chi Tiết
  if (vuViecDangXem) {
    return (
      <ChiTietPhanAnh 
        idPhanAnh={vuViecDangXem} 
        onBack={() => setVuViecDangXem(null)} // Truyền hàm để nút Quay lại hoạt động
      />
    );
  }

  // Nếu không (vuViecDangXem là null) -> Render bảng danh sách như cũ
  return (
    <div className="tiep-nhan-container">
      <div className="card-tam">
        {/* ... (Giữ nguyên code Header và Bộ lọc cũ của bạn) */}
        <div className="tiep-nhan-header">
          <h3>Danh sách Phản ánh cần điều phối</h3>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr><th>Mã PA</th><th>Tiêu đề vụ việc</th><th>Mảng</th><th>Đơn vị tiếp nhận</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {duLieuHienThi.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.id}</strong></td>
                  <td>{item.tieuDe}</td>
                  <td><span className="tag">{item.mang}</span></td>
                  <td>{item.donVi}</td>
                  <td><span className={`status-badge ${item.trangThai === 'Chưa xử lý' ? 'danger' : 'warning'}`}>{item.trangThai}</span></td>
                  <td>
                    {/* BẮT SỰ KIỆN CLICK ĐỂ ĐỔI SANG TRANG CHI TIẾT */}
                    <button className="btn-action" onClick={() => setVuViecDangXem(item.id)}>
                      👁️ Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TiepNhanDieuPhoi;