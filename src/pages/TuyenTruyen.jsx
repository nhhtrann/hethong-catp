const TuyenTruyen = () => {
  const baiViet = [
    { id: 1, tieuDe: "Cảnh báo lừa đảo qua mạng hình thức 'Việc nhẹ lương cao'", ngayDang: "20/04/2026", luotXem: 1250 },
    { id: 2, tieuDe: "Quy định mới về xử phạt nồng độ cồn năm 2026", ngayDang: "18/04/2026", luotXem: 3400 },
    { id: 3, tieuDe: "Hành trang an toàn cho học sinh tới trường", ngayDang: "15/04/2026", luotXem: 890 }
  ];

  return (
    <div className="card-tam">
      <div className="tiep-nhan-header">
        <h3>Quản lý Bài viết Tuyên truyền</h3>
        <button className="btn-primary">📝 Soạn bài viết mới</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {baiViet.map((bai) => (
          <div key={bai.id} style={{ border: '1px solid #e2e8f0', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{bai.tieuDe}</h4>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Ngày đăng: {bai.ngayDang} • 👁️ {bai.luotXem} lượt xem</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-action">Sửa</button>
              <button className="btn-action" style={{ color: 'red' }}>Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TuyenTruyen;