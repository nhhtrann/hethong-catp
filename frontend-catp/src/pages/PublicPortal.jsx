import React, { useState, useEffect } from 'react';
import { Layout, Menu, Row, Col, Card, Typography, Button, Input, Tag, Carousel, Modal, Form, Upload, message, Statistic, Divider } from 'antd';
import { SearchOutlined, UserOutlined, EditOutlined, EnvironmentOutlined, UploadOutlined, PhoneOutlined, CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

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
  const onFinish = (values) => {
    message.success('Gửi phản ánh thành công! Đang chờ cán bộ duyệt.');
    setIsModalVisible(false);
    form.resetFields();
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

      <Modal title={<Title level={4} style={{ margin: 0, color: '#9f224e' }}>GỬI BÁO CÁO HIỆN TRƯỜNG</Title>} open={isModalVisible} onCancel={handleCancel} footer={null} width={700} style={{ top: isMobile ? 10 : 100 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: '20px' }}>
          <Form.Item label="Tiêu đề phản ánh" name="title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}><Input placeholder="Ví dụ: Rác thải vứt bừa bãi tại..." size="large" /></Form.Item>
          <Form.Item label="Nội dung chi tiết" name="description" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}><Input.TextArea rows={isMobile ? 3 : 4} placeholder="Mô tả rõ tình trạng..." /></Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}><Form.Item label="Địa điểm (Đường, phường)" name="location" rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}><Input prefix={<EnvironmentOutlined />} placeholder="Ví dụ: 77 Nguyễn Huệ" size="large" /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="Số điện thoại liên hệ" name="phone"><Input prefix={<PhoneOutlined />} placeholder="Để liên hệ khi cần" size="large" /></Form.Item></Col>
          </Row>
          <Form.Item label="Hình ảnh minh chứng (Rất quan trọng)">
            <Dragger multiple={true} listType="picture" beforeUpload={() => false}>
              <p className="ant-upload-drag-icon"><UploadOutlined style={{ color: '#9f224e' }} /></p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả ảnh vào khu vực này</p>
              <p className="ant-upload-hint">Hỗ trợ JPG, PNG. Tối đa 50MB.</p>
            </Dragger>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: '20px', marginBottom: 0 }}>
            <Button onClick={handleCancel} style={{ marginRight: '10px' }} size="large">Hủy bỏ</Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#9f224e' }}>Gửi lên hệ thống</Button>
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