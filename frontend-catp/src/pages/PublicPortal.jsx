import React, { useState, useEffect } from 'react';
import { Layout, Menu, Row, Col, Card, Typography, Button, Input, Tag, Carousel, Modal, Form, Upload, message, Statistic, Divider, Select, Switch } from 'antd';
import { SearchOutlined, UserOutlined, EditOutlined, EnvironmentOutlined, UploadOutlined, PhoneOutlined, CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

const PublicPortal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fakeReports = [
    { id: 1, title: "Hàng quán lấn chiếm vỉa hè cổng trường Đại học Khoa học", snippet: "Tình trạng bán hàng rong lấn chiếm toàn bộ vỉa hè dành cho người đi bộ, gây ùn tắc giao thông vào giờ tan tầm tại đường Nguyễn Huệ...", image: `${import.meta.env.VITE_API_URL}/uploads/photo1.jpg`, date: "18/05/2026", status: "Đang xử lý", color: "warning" },
    { id: 2, title: "Hỏng đèn tín hiệu giao thông ngã tư Hùng Vương", snippet: "Đèn đỏ tại ngã tư hướng đi cầu Trường Tiền đã hỏng từ sáng nay, các phương tiện lưu thông lộn xộn nguy hiểm.", image: `${import.meta.env.VITE_API_URL}/uploads/photo2.jpg`, date: "17/05/2026", status: "Hoàn thành", color: "success" },
    { id: 3, title: "Bãi rác tự phát bốc mùi hôi thối tại KTX Xã Tắc", snippet: "Nhiều ngày nay không có xe thu gom rác, rác thải sinh hoạt chất đống tràn ra đường bốc mùi nghiêm trọng.", image: `${import.meta.env.VITE_API_URL}/uploads/photo3.jpg`, date: "18/05/2026", status: "Chờ tiếp nhận", color: "error" },
    { id: 4, title: "Cây đổ chắn ngang đường Lê Lợi sau cơn giông", snippet: "Một cây phượng lớn đã bị bật gốc chắn ngang nửa phần đường Lê Lợi đoạn gần ga Huế.", image: `${import.meta.env.VITE_API_URL}/uploads/photo4.jpg`, date: "16/05/2026", status: "Hoàn thành", color: "success" },
    { id: 5, title: "Nước ngập sâu tại chợ Đông Ba sau mưa lớn", snippet: "Hệ thống thoát nước quá tải khiến nhiều gian hàng trong chợ Đông Ba bị ngập, tiểu thương chật vật di dời đồ đạc.", image: `${import.meta.env.VITE_API_URL}/uploads/photo5.jpg`, date: "15/05/2026", status: "Đang xử lý", color: "warning" },
  ];

  // 👉 TÁCH RIÊNG MENU: Nếu là Mobile thì ẩn nút Gửi Phản Ánh trên thanh ngang đi
  const baseMenuItems = [
    { key: 'home', label: 'Trang chủ' },
    { key: 'giaothong', label: 'Giao thông' },
    { key: 'anninh', label: 'An ninh trật tự' },
    { key: 'moitruong', label: 'Môi trường' },
    { key: 'tainan', label: 'Tai nạn' },
    { key: 'khac', label: 'Khác' },
  ];
  const menuItems = isMobile 
    ? baseMenuItems 
    : [...baseMenuItems, { key: 'submit', label: <span style={{ color: '#d90000', fontWeight: 'bold' }}><EditOutlined /> GỬI PHẢN ÁNH</span> }];

  const showModal = (e) => { if (e.key === 'submit') setIsModalVisible(true); };
  const handleCancel = () => { setIsModalVisible(false); form.resetFields(); };
  const onFinish = async (values) => {
    message.loading({ content: 'Đang xử lý dữ liệu...', key: 'submitReport' });
    
    try {
      let danhSachAnh = []; // Mảng chứa tên các file ảnh sau khi upload thành công

      // 1. KIỂM TRA & UPLOAD ẢNH LÊN SERVER TRƯỚC
      if (values.images && values.images.length > 0) {
        message.loading({ content: 'Đang tải ảnh lên hệ thống...', key: 'submitReport' });
        
        // Vì mình chưa rõ API của bạn upload từng ảnh hay nhiều ảnh 1 lúc, 
        // ở đây mình lấy tạm tấm ảnh ĐẦU TIÊN để upload (bạn có thể mở rộng sau)
        const fileUpload = values.images[0].originFileObj;
        const formData = new FormData();
        formData.append('file', fileUpload); // 'file' là tên key thường dùng ở NestJS Multer

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          
          // 👉 THÊM DÒNG NÀY: Để soi xem Backend thực sự trả về cái gì
          console.log("Dữ liệu ảnh Backend trả về:", uploadData);
          
          // Bao lô tất cả các trường hợp tên biến mà NestJS hay trả về (filename, fileName, url, path, v.v.)
          const fileName = uploadData.fileName || uploadData.filename || uploadData.url || uploadData.path || uploadData.data; 
          
          // 👉 CHẶN LỖI: Chỉ khi lấy được tên file thật mới nhét vào mảng
          if (fileName) {
            danhSachAnh.push(fileName);
          } else {
            message.warning('Up ảnh thành công nhưng không lấy được tên file!');
          }
        }
      }

      // 2. GOM DỮ LIỆU ĐÃ CÓ ẢNH ĐỂ GỬI VÀO DATABASE
      const payload = {
        tieuDe: values.title,
        noiDung: values.description,
        diaDiem: values.location,
        mucDoKhanCap: values.isUrgent || false, 
        nhomVuViec: values.incidentType,        
        truongHoc: values.school,               
        sdtNguoiGui: values.phone || "",
        
        // Biến mảng danhSachAnh thành chuỗi JSON (Ví dụ: "['anh1.jpg']") để khớp kiểu string trong SQL
        anhKiemChung: JSON.stringify(danhSachAnh), 
        
        trangThai: "Mới", 
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        message.success({ content: 'Gửi phản ánh thành công! Đang chờ cán bộ duyệt.', key: 'submitReport', duration: 3 });
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error({ content: 'Lỗi khi lưu dữ liệu!', key: 'submitReport', duration: 3 });
      }
    } catch (error) {
      message.error({ content: 'Lỗi kết nối máy chủ!', key: 'submitReport', duration: 3 });
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      
      <Header style={{ background: '#fff', padding: isMobile ? '10px 15px' : '0 50px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', height: 'auto', minHeight: '80px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 1, gap: isMobile ? '10px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '20px', width: '100%', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
          <Title level={isMobile ? 4 : 3} style={{ margin: 0, color: '#9f224e', fontWeight: 900 }}>HUE<span style={{color: '#333'}}>CONNECT</span></Title>
          <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}><EnvironmentOutlined /> T.T.Huế | 31°C</Text>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} style={{ width: isMobile ? '60%' : 250, borderRadius: '20px' }} />
          <Button type="primary" shape="round" icon={<UserOutlined />} style={{ background: '#9f224e' }}>{'Đăng nhập'}</Button>
        </div>
      </Header>

      {/* 👉 CẬP NHẬT MENU: Cấm tràn (disabledOverflow) và làm mượt thanh trượt */}
      <Menu 
        mode="horizontal" 
        items={menuItems} 
        onClick={showModal} 
        disabledOverflow={true} /* BÍ QUYẾT XÓA DẤU 3 CHẤM Ở ĐÂY */
        style={{ 
          justifyContent: isMobile ? 'flex-start' : 'center', 
          fontWeight: 600, 
          fontSize: isMobile ? '14px' : '16px', 
          position: 'sticky', 
          top: 0, 
          zIndex: 2, 
          borderBottom: '3px solid #9f224e',
          overflowX: 'auto', 
          display: 'flex',
          flexWrap: 'nowrap', 
          WebkitOverflowScrolling: 'touch', // Trượt siêu mượt trên iPhone
          scrollbarWidth: 'none', // Ẩn thanh cuộn xấu xí trên web
        }} 
      />

      <Content style={{ padding: isMobile ? '15px' : '30px 50px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        <Carousel autoplay effect="fade" style={{ marginBottom: isMobile ? '20px' : '40px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div><div style={{ height: isMobile ? '200px' : '350px', backgroundImage: `url(${import.meta.env.VITE_API_URL}/uploads/photo4.jpg)`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}></div></div>
          <div><div style={{ height: isMobile ? '200px' : '350px', backgroundImage: `url(${import.meta.env.VITE_API_URL}/uploads/photo5.jpg)`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}></div></div>
        </Carousel>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Title level={4} style={{ borderLeft: '5px solid #9f224e', paddingLeft: '12px', marginBottom: '20px' }}>TIN HIỆN TRƯỜNG</Title>
            <Card hoverable cover={<div style={{ height: isMobile ? '220px' : '350px', backgroundImage: `url(${fakeReports[0].image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>} bodyStyle={{ padding: '20px' }} bordered={false} style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}>
              <Tag color={fakeReports[0].color} style={{ marginBottom: '10px' }}>{fakeReports[0].status}</Tag>
              <Title level={isMobile ? 4 : 3} style={{ marginBottom: '10px', lineHeight: 1.3 }}>{fakeReports[0].title}</Title>
              <Paragraph style={{ fontSize: '15px', color: '#555' }}>{fakeReports[0].snippet}</Paragraph>
              <Text type="secondary">{fakeReports[0].date}</Text>
            </Card>

            <Row gutter={[16, 16]}>
              {fakeReports.slice(1).map(report => (
                <Col xs={24} sm={12} key={report.id}>
                  <Card hoverable cover={<div style={{ height: '180px', backgroundImage: `url(${report.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>} bordered={false} style={{ borderRadius: '12px', overflow: 'hidden', height: '100%' }}>
                    <Tag color={report.color} style={{ marginBottom: '10px' }}>{report.status}</Tag>
                    <Title level={5} style={{ margin: '0 0 10px 0', minHeight: '45px', lineHeight: 1.4 }}>{report.title}</Title>
                    <Text type="secondary">{report.date}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>

          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '24px', background: '#9f224e', color: 'white' }}>
              <Title level={5} style={{ color: 'white', textAlign: 'center', marginTop: 0 }}><PhoneOutlined /> ĐƯỜNG DÂY NÓNG</Title>
              <Title level={isMobile ? 3 : 2} style={{ color: '#ffd700', textAlign: 'center', margin: '10px 0' }}>1900 1234</Title>
              <p style={{ textAlign: 'center', margin: 0 }}>Trực ban 24/7 Công an TP. Huế</p>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Title level={5} style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>📊 THỐNG KÊ TRONG TUẦN</Title>
              <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col span={12}><Statistic title="Đã tiếp nhận" value={128} prefix={<InboxOutlined />} valueStyle={{ fontSize: isMobile ? '20px' : '24px' }} /></Col>
                <Col span={12}><Statistic title="Đã giải quyết" value={112} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#3f8600', fontSize: isMobile ? '20px' : '24px' }} /></Col>
              </Row>
              <Divider />
              {/* Nút gửi ẩn trên Mobile vì đã có nút nổi */}
              {!isMobile && (
                <Button type="primary" block size="large" onClick={() => setIsModalVisible(true)} style={{ background: '#9f224e', height: '50px', fontSize: '16px', fontWeight: 'bold' }}>
                  <EditOutlined /> TẠO PHẢN ÁNH
                </Button>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      <Modal title={<Title level={4} style={{ margin: 0, color: '#9f224e' }}>GỬI BÁO CÁO HIỆN TRƯỜNG</Title>} open={isModalVisible} onCancel={handleCancel} footer={null} width={750} style={{ top: isMobile ? 10 : 50 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: '20px' }} initialValues={{ isUrgent: false }}>
          
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item label="Tiêu đề vụ việc" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}><Input placeholder="Ví dụ: Đánh nhau cổng trường, Thuốc lá điện tử..." size="large" /></Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              {/* Theo Mục 4: Phân loại mức độ khẩn cấp */}
              <Form.Item label={<span style={{color: 'red', fontWeight: 'bold'}}>Mức độ khẩn cấp?</span>} name="isUrgent" valuePropName="checked">
                <Switch checkedChildren="Khẩn cấp" unCheckedChildren="Bình thường" style={{ marginTop: '5px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              {/* Theo Bước 2: Phân loại nhóm vụ việc */}
              <Form.Item label="Nhóm vụ việc" name="incidentType" rules={[{ required: true, message: 'Chọn nhóm vụ việc!' }]}>
                <Select placeholder="-- Chọn loại vi phạm --" size="large">
                  <Option value="baoluc">Bạo lực học đường</Option>
                  <Option value="matuy">Nghi ngờ Ma túy / Tệ nạn</Option>
                  <Option value="giaothong">Vi phạm An toàn giao thông</Option>
                  <Option value="anninh">Mất an ninh trật tự / Trộm cắp</Option>
                  <Option value="khac">Khác...</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              {/* Theo Bước 2: Xác định trường học */}
              <Form.Item label="Thuộc trường/Cơ sở" name="school" rules={[{ required: true, message: 'Chọn trường học!' }]}>
                <Select placeholder="-- Chọn trường học --" size="large" showSearch>
                  <Option value="dhkh">Đại học Khoa học Huế</Option>
                  <Option value="dhs">Đại học Sư phạm Huế</Option>
                  <Option value="qhc">THPT Quốc Học</Option>
                  <Option value="hbt">THPT Hai Bà Trưng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Vị trí / Lớp học (Chi tiết)" name="location" rules={[{ required: true, message: 'Nhập vị trí cụ thể!' }]}><Input prefix={<EnvironmentOutlined />} placeholder="VD: Lớp 10A1, Cổng phụ..." size="large" /></Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              {/* Theo Mục 6: Bảo mật thông tin người phản ánh */}
              <Form.Item label="Số điện thoại / Zalo (Sẽ được bảo mật)" name="phone"><Input prefix={<PhoneOutlined />} placeholder="Để CA liên hệ hỗ trợ" size="large" /></Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả chi tiết diễn biến" name="description" rules={[{ required: true, message: 'Vui lòng mô tả!' }]}><Input.TextArea rows={3} placeholder="Mô tả rõ sự việc đang diễn ra, đặc điểm người vi phạm..." /></Form.Item>
          
          {/* 👉 ĐÃ SỬA: Thêm name="images" và cách lấy dữ liệu file */}
          <Form.Item 
            label="Hình ảnh/Video minh chứng (Rất quan trọng)" 
            name="images"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) { return e; }
              return e?.fileList;
            }}
          >
            <Dragger multiple={true} listType="picture" beforeUpload={() => false}>
              <p className="ant-upload-drag-icon"><UploadOutlined style={{ color: '#9f224e' }} /></p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào khu vực này</p>
              <p className="ant-upload-hint">Đính kèm ảnh hiện trường giúp cơ quan chức năng xử lý nhanh hơn.</p>
            </Dragger>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: '20px', marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: '10px' }} size="large">Hủy bỏ</Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#9f224e' }}>GỬI PHẢN ÁNH NGAY</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Footer style={{ textAlign: 'center', background: '#2c3e50', color: 'white', padding: isMobile ? '15px' : '20px', fontSize: isMobile ? '12px' : '14px' }}>
        <strong>HUE CONNECT</strong> - Cổng thông tin phản ánh hiện trường<br/>
      </Footer>

      {/* 👉 NÚT NỔI BẬT DÀNH RIÊNG CHO MOBILE (Floating Action Button) */}
      {isMobile && (
        <Button 
          type="primary" 
          shape="circle" 
          icon={<EditOutlined style={{ fontSize: '24px' }} />} 
          size="large"
          onClick={() => setIsModalVisible(true)}
          style={{
            position: 'fixed', // Ghim chặt lên màn hình
            bottom: '20px',    // Cách đáy 20px
            right: '20px',     // Cách lề phải 20px
            zIndex: 999,       // Luôn nổi lên trên cùng
            background: '#9f224e',
            border: 'none',
            width: '60px',
            height: '60px',
            boxShadow: '0 4px 12px rgba(159,34,78,0.4)', // Đổ bóng cho đẹp
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      )}
    </Layout>
  );
};

export default PublicPortal;