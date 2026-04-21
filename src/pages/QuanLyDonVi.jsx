const QuanLyDonVi = () => {
  const danhSachDonVi = [
    { id: "DV01", ten: "Công an Quận Phú Nhuận", lienHe: "Đại úy Lê C", sdt: "0901234567", trangThai: "Hoạt động" },
    { id: "DV02", ten: "Công an Quận 1", lienHe: "Thiếu tá Trần D", sdt: "0987654321", trangThai: "Hoạt động" },
    { id: "DV03", ten: "Đội CSGT Bến Thành", lienHe: "Trung úy Nguyễn E", sdt: "0911222333", trangThai: "Tạm ngưng" }
  ];

  return (
    <div className="card-tam">
      <div className="tiep-nhan-header">
        <h3>Quản lý Đơn vị phối hợp</h3>
        <button className="btn-primary">+ Thêm đơn vị mới</button>
      </div>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Mã ĐV</th>
            <th>Tên đơn vị</th>
            <th>Người liên hệ (Chỉ huy)</th>
            <th>Số điện thoại</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {danhSachDonVi.map((dv) => (
            <tr key={dv.id}>
              <td><strong>{dv.id}</strong></td>
              <td>{dv.ten}</td>
              <td>{dv.lienHe}</td>
              <td>{dv.sdt}</td>
              <td>
                <span className={`status-badge ${dv.trangThai === 'Hoạt động' ? 'success' : 'danger'}`}>
                  {dv.trangThai}
                </span>
              </td>
              <td><button className="btn-action">Sửa</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuanLyDonVi;