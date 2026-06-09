# 🛡️ Hue Connect - An Ninh Học Đường (CATP Hue Real-time Reporting System)

> Hệ thống Tiếp nhận Phản ánh và Tuyên truyền Pháp luật.
> Đồ án Thực tập Tốt nghiệp - Khoa Công nghệ Thông tin, Đại học Khoa học - Đại học Huế (2026).

📑 Giới thiệu chung
**Hue Connect** là nền tảng quản trị và điều phối nghiệp vụ an ninh trật tự trực tuyến. Hệ thống đóng vai trò làm cầu nối giữa **Người dân (Học sinh, Sinh viên, Phụ huynh)** và **Cơ quan Công an / Đơn vị Trường học**, giúp việc báo cáo, tiếp nhận và xử lý các vụ việc vi phạm pháp luật diễn ra minh bạch, nhanh chóng và chính xác.

Hệ thống được thiết kế dựa trên kiến trúc phân lớp, tối ưu hiển thị trên cả PC và Mobile (Responsive), đồng thời tích hợp hệ thống **Đồng hồ đếm ngược Deadline (SLA)** để đảm bảo tiến độ giải quyết hồ sơ.

## ✨ Tính năng Nổi bật (Core Features)

### 1. Dành cho Người Dân (Public Portal)
* **Gửi phản ánh 1 chạm:** Hỗ trợ form điền nhanh, đính kèm ảnh bằng chứng trực quan.
* **Định vị & Quét QR Code:** Tự động điền sẵn tên cơ sở giáo dục dựa trên tham số đường dẫn (ví dụ quét mã QR tại cổng trường).
* **Bảo mật danh tính:** Tích hợp tính năng chuyển đổi linh hoạt giữa "Công khai" và "Ẩn danh hoàn toàn".
* **Tra cứu Real-time:** Nhận mã số vụ việc (VD: `RP-1234`) và theo dõi tiến độ xử lý qua Timeline.
* **Danh bạ điện thoại:** Hỗ trợ bộ lọc động để người dân dễ dàng tra cứu và gọi trực tiếp đến trực ban Công an Phường/Xã.

Giao diện HueConnect:

<img width="1235" height="805" alt="image" src="https://github.com/user-attachments/assets/58ee348f-2f5d-48fc-8be8-8f051eb5d4fe" />
<img width="1235" height="855" alt="image" src="https://github.com/user-attachments/assets/7a13f545-82dc-4cb2-bcd4-d3b97a0a1717" />
<img width="1235" height="856" alt="image" src="https://github.com/user-attachments/assets/41f42b78-b4ae-4895-acc6-f70e32992138" />

### 2. Dành cho Ban Quản Trị & Điều Phối (Admin Dashboard - CATP)
* **Quản lý SLA (Mức độ ưu tiên):** Tự động tính toán Deadline theo 5 cấp độ:
  * 🔴 Nguy kịch (6h) | 🟠 Cao (12h) | 🟡 Trung bình (24h) | 🔵 Thấp (72h) | 🟢 Rất thấp (168h).
* **Bảng điều khiển thông minh:** Lọc vụ việc theo Trạng thái, Mảng vi phạm, Đơn vị xử lý.
* **Phân công tự động (Dispatch):** Chuyển hồ sơ xuống đơn vị thụ lý (Phường/Trường học) chỉ bằng 1 thao tác.
* **Xuất báo cáo chuyên nghiệp:** Trích xuất dữ liệu ra file Excel có định dạng màu sắc, kẻ khung (sử dụng thư viện ExcelJS).

Giao diện chính Admin:

<img width="1240" height="858" alt="image" src="https://github.com/user-attachments/assets/e61b2355-cd1c-4c2e-8212-238e2bc8f0ed" />
<img width="1509" height="855" alt="image" src="https://github.com/user-attachments/assets/29e64855-7c95-4dc6-9093-c533f132e1b9" />
<img width="836" height="823" alt="image" src="https://github.com/user-attachments/assets/8181f7d2-4bc9-4026-8c5f-6b83eeab2b0d" />
<img width="1509" height="849" alt="image" src="https://github.com/user-attachments/assets/fb4a910e-00e4-4c42-86b6-cea860f87365" />
<img width="1501" height="851" alt="image" src="https://github.com/user-attachments/assets/39a9d5ae-775b-48b1-b5c6-028ba89c197b" />
<img width="1507" height="857" alt="image" src="https://github.com/user-attachments/assets/231814cb-2888-4af5-a00c-0306b751193f" />

### 3. Dành cho Đơn Vị Thụ Lý (Unit Dashboard - Phường/Trường)
* **Tiếp nhận nhiệm vụ:** Cập nhật kết quả xử lý, đính kèm biên bản/hình ảnh hoàn thành.
* **Cảnh báo tiến độ:** Thanh Progress Bar thay đổi màu sắc dựa trên số giờ còn lại.
* **Chốt hồ sơ:** Chuyển trạng thái "Chờ duyệt" để trình lên Ban Quản trị.

Giao diện cán bộ quản lý:

<img width="1508" height="855" alt="image" src="https://github.com/user-attachments/assets/5ce0ac92-3259-4894-8f1b-02a7a233d31f" />

## 🛠️ Công nghệ Ứng dụng (Tech Stack)

| Phân hệ | Công nghệ cốt lõi | Chức năng chính |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Ant Design | Xây dựng Single Page Application (SPA), UI/UX chuẩn hành chính, đồ thị thống kê (Recharts). |
| **Backend** | NestJS (Node.js), TypeORM | RESTful API, Validation dữ liệu, phân quyền luồng dữ liệu (Roles Guards). |
| **Database** | SQL Server 2014 | Cơ sở dữ liệu quan hệ, lưu trữ cấu trúc khóa ngoại chặt chẽ. |
| **Realtime** | Socket.io | Đồng bộ thông báo đẩy (Push Notifications) giữa Admin và Unit. |
| **Tiện ích** | ExcelJS, Multer | Trích xuất báo cáo, xử lý Upload file hình ảnh. |

## 🚀 Hướng dẫn Cài đặt & Chạy dự án (Getting Started)

### Yêu cầu hệ thống (Prerequisites)
* Node.js (v18.x trở lên)
* SQL Server 2014 (hoặc cao hơn)
* Git

### Cài đặt Database
1. Tạo một cơ sở dữ liệu mới trong SQL Server với tên `hethong-catp`.
2. Hệ thống sử dụng cơ chế `synchronize: true` của TypeORM, các bảng sẽ tự động được tạo khi chạy Backend.

🧑‍💻 Đội ngũ phát triển (Team Members)
Đồ án được thực hiện bởi Nhóm 20:
Nguyễn Hoàng Huyền Trân (22T102070) - Backend Developer & Database Architecture.
Hồ Văn Tấn Phát (22T1020306) - Frontend Developer & UI/UX Designer.
Giáo viên Hướng dẫn: TS Nguyễn Đăng Bình.
Đơn vị hướng dẫn: Lê Quang Phước
