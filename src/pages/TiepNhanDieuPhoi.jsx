// src/pages/TiepNhanDieuPhoi.jsx
import { useState } from 'react';

const TiepNhanDieuPhoi = () => {
  const danhSachPhanAnh = [
    { id: "PA001", tieuDe: "Đua xe trái phép tại Lê Lợi", mang: "Giao thông", donVi: "CA TP. Huế", trangThai: "Chưa xử lý", ngay: "21/04/2026" },
    { id: "PA002", tieuDe: "Tụ tập hút cỏ mỹ gần trường ĐH Khoa học", mang: "Ma túy", donVi: "CA P. Phú Nhuận", trangThai: "Đang xử lý", ngay: "20/04/2026" },
    { id: "PA003", tieuDe: "Học sinh đánh nhau trước cổng trường", mang: "Bạo lực học đường", donVi: "CA P. Vĩnh Ninh", trangThai: "Đã xử lý", ngay: "19/04/2026" },
    { id: "PA004", tieuDe: "Vượt đèn đỏ ngã 6", mang: "Giao thông", donVi: "CA TP. Huế", trangThai: "Đã xử lý", ngay: "18/04/2026" }
  ];

  const [locMang, setLocMang] = useState("Tất cả");
  const [locTrangThai, setLocTrangThai] = useState("Tất cả");

  const duLieuHienThi = danhSachPhanAnh.filter((item) => {
    const dungMang = locMang === "Tất cả" || item.mang === locMang;
    const dungTrangThai = locTrangThai === "Tất cả" || item.trangThai === locTrangThai;
    return dungMang && dungTrangThai;
  });

  return (
    <div className="tiep-nhan-container">
      <div className="card-tam">
        <div className="tiep-nhan-header">
          <h3>Danh sách Phản ánh cần điều phối</h3>
          <button className="btn-primary">+ Thêm phản ánh mới</button>
        </div>
        <div className="filter-bar">
          <select value={locMang} onChange={(e) => setLocMang(e.target.value)}>
            <option value="Tất cả">Lọc theo Mảng (Tất cả)</option>
            <option value="Giao thông">Giao thông</option>
            <option value="Ma túy">Ma túy</option>
            <option value="Bạo lực học đường">Bạo lực học đường</option>
          </select>
          <select value={locTrangThai} onChange={(e) => setLocTrangThai(e.target.value)}>
            <option value="Tất cả">Lọc theo Trạng thái (Tất cả)</option>
            <option value="Chưa xử lý">🔴 Chưa xử lý</option>
            <option value="Đang xử lý">🟡 Đang xử lý</option>
            <option value="Đã xử lý">🟢 Đã xử lý</option>
          </select>
          <div className="filter-result-text">Tìm thấy <strong>{duLieuHienThi.length}</strong> kết quả</div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr><th>Mã PA</th><th>Tiêu đề vụ việc</th><th>Mảng</th><th>Đơn vị tiếp nhận</th><th>Trạng thái</th><th>Ngày nhận</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {duLieuHienThi.length > 0 ? (
                duLieuHienThi.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
                    <td>{item.tieuDe}</td>
                    <td><span className="tag">{item.mang}</span></td>
                    <td>{item.donVi}</td>
                    <td><span className={`status-badge ${item.trangThai === 'Đã xử lý' ? 'success' : item.trangThai === 'Đang xử lý' ? 'warning' : 'danger'}`}>{item.trangThai}</span></td>
                    <td>{item.ngay}</td>
                    <td><button className="btn-action">Xem</button></td>
                  </tr>
                ))
              ) : (<tr><td colSpan="7" className="text-center">Không có dữ liệu phù hợp.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TiepNhanDieuPhoi;