import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Select, Button, Upload, message, Typography, 
Row, Col, Avatar, Dropdown, Tag, Space, Switch, Modal, Empty, Spin, 
Drawer, Carousel, Steps } from 'antd';
import { 
  UserOutlined, LogoutOutlined, SendOutlined, 
  EnvironmentOutlined, UploadOutlined, PhoneOutlined, 
  SafetyCertificateOutlined, NotificationOutlined, ClockCircleOutlined,
  FireFilled, PhoneFilled, FilterOutlined, CheckCircleOutlined, 
  CopyOutlined, SearchOutlined
} from '@ant-design/icons'; 
import { useNavigate, useSearchParams } from 'react-router-dom';
import imgBanner1 from '../assets/photo6.jpg';
import imgBanner2 from '../assets/photo7.jpg';
import imgBanner3 from '../assets/photo8.jpg';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PublicPortal = () => {
  const [form] = Form.useForm();
  const userInfo = JSON.parse(localStorage.getItem('catp_user')) || null;

  // States
  const [categories, setCategories] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [trackingCode, setTrackingCode] = useState(null);
  const [isTrackingModalVisible, setIsTrackingModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [feedData, setFeedData] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tất cả'); 
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const urlSchoolId = searchParams.get('schoolId');

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    // Đã thay units thành schools
    if (urlSchoolId && schools && schools.length > 0) {
      form.setFieldsValue({ school: Number(urlSchoolId) }); 
    }
  }, [urlSchoolId, form, schools]); 

  const fetchData = async () => {
    try {
      // Bắn 4 request cùng một lúc, tiết kiệm 70% thời gian chờ
      const [catRes, unitRes, newsRes, reportsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/reports/categories/list`),
        fetch(`${import.meta.env.VITE_API_URL}/units`),
        fetch(`${import.meta.env.VITE_API_URL}/news`),
        fetch(`${import.meta.env.VITE_API_URL}/reports`)
      ]);

      const [catData, unitData, newsRaw, reportsRaw] = await Promise.all([
        catRes.json(),
        unitRes.json(),
        newsRes.json(),
        reportsRes.json()
      ]);

      setCategories(catData);
      setSchools(unitData.filter(u => u.tenDonVi.includes('Đại học') || u.tenDonVi.includes('THPT')));

      let combinedFeed = [];

      if (Array.isArray(newsRaw)) {
        const formattedNews = newsRaw.map(n => ({
          id: `news-${n.id}`, type: 'Tin tức', title: n.tieuDe,
          content: n.moTaNgan || n.noiDung, date: new Date(n.ngayDang || Date.now()),
          image: getImageUrl(n.hinhAnh) || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', 
          categoryName: 'Tuyên truyền'
        }));
        combinedFeed = [...combinedFeed, ...formattedNews];
      }

      if (Array.isArray(reportsRaw)) {
        const formattedReports = reportsRaw
          .filter(r => r.trangThai === 'Hoàn thành')
          .map(r => ({
              id: `report-${r.id}`, type: 'Phản ánh', title: `[Đã xử lý] ${r.tieuDe}`,
              content: r.ghiChuKetQua || r.noiDung, date: new Date(r.ngayGui || Date.now()),
              image: getImageUrl(r.anhKetQua) || getImageUrl(r.anhKiemChung) || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
              categoryName: r.category ? r.category.tenDanhMuc : 'Khác'
            }));
        combinedFeed = [...combinedFeed, ...formattedReports];
      }

      combinedFeed.sort((a, b) => b.date - a.date);
      setFeedData(combinedFeed);
      setLoadingFeed(false);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setLoadingFeed(false);
    }
  };

  const getImageUrl = (imageInput) => {
    if (!imageInput || (Array.isArray(imageInput) && imageInput.length === 0)) return null;

    let imageUrl = imageInput;
    if (typeof imageUrl === 'string' && imageUrl.startsWith('[')) {
      try { imageUrl = JSON.parse(imageUrl); } catch (e) {}
    }
    if (Array.isArray(imageUrl)) imageUrl = imageUrl[0];
    if (!imageUrl || typeof imageUrl !== 'string') return null;

    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image') || imageUrl.startsWith('blob:')) {
      return imageUrl;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, ''); 
    let imagePath = imageUrl;
    
    if (!imagePath.includes('uploads/')) {
      imagePath = imagePath.startsWith('/') ? `/uploads${imagePath}` : `/uploads/${imagePath}`;
    } else {
      imagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    }
    
    return `${baseUrl}${imagePath}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('catp_user');
    window.location.href = '/';
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const onFinishSubmit = async (values) => {
    setLoadingForm(true);
    message.loading({ content: 'Đang gửi...', key: 'submit' });
    
    try {
     const formData = new FormData();
      
      // Text
      formData.append('tieuDe', String(values.title));
      formData.append('noiDung', String(values.description));
      formData.append('diaDiem', String(values.location || ""));
      formData.append('trangThai', 'Mới');

      // 👉 ĐÃ SỬA: Ép kiểu Number cho các ID
      formData.append('categoryId', Number(values.incidentType));
      formData.append('schoolId', Number(values.school));
      
      // 👉 ĐÃ SỬA: Ép kiểu Boolean cho mucDoKhanCap
      // Lưu ý: class-validator cần giá trị boolean thật sự (true/false)
      formData.append('mucDoKhanCap', values.isUrgent === true || values.isUrgent === 'true');

      // Xử lý người gửi
      if (isAnonymous) {
        formData.append('sdtNguoiGui', ""); 
      } else {
        formData.append('sdtNguoiGui', String(values.phone || ""));
        if (userInfo?.id) formData.append('nguoiGuiId', Number(userInfo.id));
      }

      // Ảnh
      if (values.images && values.images.length > 0) {
        values.images.forEach(img => {
          if (img.originFileObj) {
            formData.append('images', img.originFileObj);
          }
        });
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports`, {
        method: 'POST',
        body: formData 
      });

      const result = await response.json();
      for (let pair of formData.entries()) {
        console.log("Đang gửi key:", pair[0], "value:", pair[1]);
      }
      if (response.ok) {
        message.success('Gửi báo cáo thành công!');
        form.resetFields();
        setIsSubmitModalVisible(false);
        fetchData();
        const reportId = result?.id || Math.floor(100000 + Math.random() * 900000);
        setTrackingCode(`RP-${reportId}`);
      } else {
        console.error("Lỗi chi tiết:", result.message);
        message.error('Lỗi: ' + (Array.isArray(result.message) ? result.message[0] : result.message));
      }
    } catch (error) {
      message.error('Lỗi kết nối!');
    } finally {
      setLoadingForm(false);
    }
  };

  const filteredFeed = activeFilter === 'Tất cả' 
    ? feedData 
    : feedData.filter(item => item.type === activeFilter || item.categoryName === activeFilter);

  const filterTags = ['Tất cả', 'Tuyên truyền', ...categories.map(c => c.tenDanhMuc)];

  const featuredArticle = filteredFeed.length > 0 ? filteredFeed[0] : null;
  const regularArticles = filteredFeed.length > 1 ? filteredFeed.slice(1) : [];

  // 👉 3. Hàm xử lý tra cứu mã RP-xxx
  const handleSearchTracking = async () => {
    if (!searchInput.trim()) return message.warning('Vui lòng nhập mã tra cứu!');
    
    // Tách lấy con số từ chuỗi (VD: nhập RP-45 hay 45 đều lấy được số 45)
    const idMatch = searchInput.match(/\d+/);
    if (!idMatch) {
      setTrackingResult(null);
      setHasSearched(true); // Bật cờ đã tìm kiếm
      return; 
    }

    setIsSearching(true);
    setHasSearched(false); // Reset cờ trong lúc đang chờ API
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reports/${idMatch[0]}`);
      if (res.ok) {
        const data = await res.json();
        setTrackingResult(data);
      } else {
        setTrackingResult(null); // Tìm không ra -> set null
      }
    } catch (error) {
      setTrackingResult(null);
    } finally {
      setIsSearching(false);
      setHasSearched(true); // Bật cờ đã tìm kiếm xong
    }
  };
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* HEADER GIỮ NGUYÊN NHƯ CŨ */}
      <div style={{ background: '#0a3055', color: '#fff', padding: '6px 5%', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
        <div><Text style={{ color: '#e6f7ff' }}><SafetyCertificateOutlined /> Cổng thông tin Tuyên truyền & Tiếp nhận phản ánh</Text></div>
        <div><Text style={{ color: '#e6f7ff' }}><PhoneFilled /> Hotline CATP Huế: <b>0234.3xxx.xxx</b> hoặc <b>113</b></Text></div>
      </div>

      <Header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        background: '#fff', 
        padding: window.innerWidth > 768 ? '0 5%' : '0 10px', // 👉 Bóp lề hai bên trên điện thoại
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 1000, height: '72px',
        overflow: 'hidden'
      }}>
        {/* KHỐI LOGO / TIÊU ĐỀ */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 1, marginRight: '8px' }}>
          <Title level={window.innerWidth > 768 ? 3 : 5} style={{ margin: 0, color: '#0a3055', fontFamily: 'serif', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
            HUE CONNECT
          </Title>
        </div>

        {/* KHỐI NÚT BẤM BÊN PHẢI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth > 768 ? '20px' : '6px', flexShrink: 0 }}>
          
          {/* Nút Tra Cứu */}
          <Button 
            type="default" 
            icon={<SearchOutlined />} 
            onClick={() => {
              setIsTrackingModalVisible(true);
              setTrackingResult(null); 
              setSearchInput('');
              setHasSearched(false);
            }}
            style={{ 
              height: '40px', fontWeight: 'bold', borderRadius: '6px', color: '#0a3055', borderColor: '#0a3055',
              padding: window.innerWidth > 768 ? '4px 15px' : '4px 8px' // 👉 Ép nút nhỏ lại trên mobile
            }}
          >
            {window.innerWidth > 768 ? 'TRA CỨU' : ''}
          </Button>

          {/* Nút Gửi */}
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={() => setIsSubmitModalVisible(true)}
            style={{ 
              background: '#e11d48', border: 'none', height: '40px', fontWeight: 'bold', borderRadius: '6px', 
              boxShadow: '0 4px 10px rgba(225, 29, 72, 0.3)',
              padding: window.innerWidth > 768 ? '4px 15px' : '4px 8px' 
            }}
          >
            {window.innerWidth > 768 ? 'GỬI PHẢN ÁNH' : 'GỬI'}
          </Button>

          {/* Khối User & Nút Quản lý */}
          {userInfo ? (
            <Space size={window.innerWidth > 768 ? 'middle' : 'small'}>
              
              {/* 👉 NÚT VÀO QUẢN LÝ (Đã rút gọn chữ trên Mobile và sửa link) */}
              {(userInfo.role === 'admin' || userInfo.role === 'unit') && (
                <Button 
                  type="primary" 
                  style={{ 
                    background: '#10b981', borderColor: '#10b981', fontWeight: 'bold', borderRadius: '6px',
                    padding: window.innerWidth > 768 ? '4px 15px' : '4px 8px' 
                  }}
                  onClick={() => {
                    if (userInfo.role === 'admin') window.location.href = '/dashboard';
                    else if (userInfo.role === 'unit') window.location.href = '/bao-cao-ket-qua';
                  }}
                >
                  {window.innerWidth > 768 ? 'Vào trang Quản lý' : 'Quản lý'}
                </Button>
              )}

              <Dropdown menu={{
                items: [
                  { key: 'info', disabled: true, label: <div style={{ color: '#333' }}><b>{userInfo.fullName || 'Cán bộ / Người dân'}</b><br/><span style={{fontSize:'12px', color:'#888'}}>{userInfo.email}</span></div> },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, danger: true, label: 'Đăng xuất', onClick: handleLogout },
                ]
              }} placement="bottomRight" trigger={['click']}>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '4px' }}>
                  <Avatar src={userInfo.avatar} icon={!userInfo.avatar && <UserOutlined />} style={{ backgroundColor: '#0a3055' }} />
                </div>
              </Dropdown>

            </Space>
          ) : (
            <Button 
              type="default" 
              onClick={() => window.location.href = '/login'}
              style={{ padding: window.innerWidth > 768 ? '4px 15px' : '4px 8px' }}
            >
              {window.innerWidth > 768 ? 'Đăng nhập' : 'Đăng nhập'}
            </Button>
          )}
        </div>
      </Header>

      {/* NỘI DUNG TIN TỨC GIỮ NGUYÊN NHƯ CŨ */}
      <Content style={{ padding: '30px 5%', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '30px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Carousel autoplay effect="fade">
            <div>
              <img 
                src={imgBanner1} 
                alt="Banner 1" 
                style={{ 
                  width: '100%', 
                  height: window.innerWidth > 768 ? '350px' : '180px', 
                  objectFit: 'cover', // Đảm bảo ảnh lấp đầy khung mà không bị méo
                  display: 'block' 
                }} 
              />
            </div>
            <div>
              <img 
                src={imgBanner2} 
                alt="Banner 2" 
                style={{ 
                  width: '100%', 
                  height: window.innerWidth > 768 ? '350px' : '180px', 
                  objectFit: 'cover', 
                  display: 'block' 
                }} 
              />
            </div>
            <div>
              <img 
                src={imgBanner3} 
                alt="Banner 3" 
                style={{ 
                  width: '100%', 
                  height: window.innerWidth > 768 ? '350px' : '180px', 
                  objectFit: 'cover', 
                  display: 'block' 
                }} 
              />
            </div>
          </Carousel>
        </div>

        <div style={{ 
          display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', 
          paddingBottom: '16px', marginBottom: '24px', borderBottom: '2px solid #f0f0f0',
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
        }}>
          {filterTags.map(tag => (
            <span
              key={tag}
              onClick={() => setActiveFilter(tag)}
              style={{ 
                fontSize: '15px', fontWeight: activeFilter === tag ? 'bold' : '500', 
                color: activeFilter === tag ? '#e11d48' : '#555',
                marginRight: '24px', cursor: 'pointer', position: 'relative',
                paddingBottom: '12px'
              }}
            >
              {tag}
              {activeFilter === tag && (
                <div style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '2px', background: '#e11d48' }} />
              )}
            </span>
          ))}
        </div>

        {loadingFeed ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
        ) : filteredFeed.length === 0 ? (
          <Empty description="Chưa có bản tin nào trong chuyên mục này" style={{ padding: '50px' }} />
        ) : (
          <>
            {featuredArticle && (
              <Row gutter={[32, 32]} style={{ marginBottom: '40px' }}>
                <Col xs={24} md={16}>
                  <div style={{ overflow: 'hidden', borderRadius: '8px', cursor: 'pointer' }}>
                    <img 
                      src={featuredArticle.image} 
                      alt={featuredArticle.title} 
                      style={{ width: '100%', height: window.innerWidth > 768 ? '400px' : '250px', objectFit: 'cover', transition: 'transform 0.5s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                </Col>
                <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Tag color={featuredArticle.type === 'Tin tức' ? 'blue' : 'green'} style={{ alignSelf: 'flex-start', marginBottom: '12px' }}>
                    {featuredArticle.categoryName}
                  </Tag>
                  <Title level={2} style={{ marginTop: 0, fontFamily: 'serif', lineHeight: 1.3, color: '#111' }}>
                    {featuredArticle.title}
                  </Title>
                  <Paragraph style={{ fontSize: '16px', color: '#555', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {featuredArticle.content}
                  </Paragraph>
                  <Text type="secondary" style={{ marginTop: 'auto' }}><ClockCircleOutlined /> {featuredArticle.date.toLocaleDateString('vi-VN')}</Text>
                </Col>
              </Row>
            )}

            <Row gutter={[24, 40]}>
              {regularArticles.map(item => (
                <Col xs={24} sm={12} md={8} key={item.id}>
                  <div style={{ cursor: 'pointer', group: 'true' }}>
                    <div style={{ overflow: 'hidden', borderRadius: '6px', marginBottom: '12px', position: 'relative' }}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        style={{ width: '100%', height: '200px', objectFit: 'cover', transition: 'transform 0.5s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      {item.type === 'Phản ánh' && (
                        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(82, 196, 26, 0.9)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          ĐÃ XỬ LÝ
                        </div>
                      )}
                    </div>
                    <Title level={4} style={{ margin: '0 0 8px 0', fontFamily: 'serif', lineHeight: 1.4, color: '#222' }}>
                      {item.title}
                    </Title>
                    <Paragraph style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.content}
                    </Paragraph>
                    <div style={{ fontSize: '12px', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
                      <span><FireFilled style={{ color: '#bfbfbf' }} /> {item.categoryName}</span>
                      <span>{item.date.toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5', color: '#888', padding: '30px 50px', borderTop: '1px solid #e8e8e8' }}>
        Công an Thành phố Huế ©2026 - Cổng thông tin Tuyến truyền Pháp luật & Tiếp nhận phản ánh
      </Footer>

      {/* ================= MODAL GỬI PHẢN ÁNH CÓ TÍNH NĂNG ẨN DANH ================= */}
      <Modal
        title={<div style={{ fontSize: '18px', color: '#0a3055' }}><NotificationOutlined /> Cung cấp thông tin phản ánh</div>}
        open={isSubmitModalVisible}
        onCancel={() => { setIsSubmitModalVisible(false); form.resetFields(); setIsAnonymous(true); }}
        footer={null} 
        width={700}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinishSubmit} size="large" initialValues={{ isUrgent: false }}>
          
          {/* 👉 UI CÔNG TẮC ẨN DANH / CÔNG KHAI */}
          <div style={{ padding: '16px', background: isAnonymous ? '#f6ffed' : '#e6f7ff', borderRadius: '8px', marginBottom: '20px', border: isAnonymous ? '1px solid #b7eb8f' : '1px solid #91d5ff', transition: 'all 0.3s' }}>
            <Row align="middle" justify="space-between">
              <Col xs={18}>
                <b style={{ color: isAnonymous ? '#389e0d' : '#005bac', fontSize: '15px' }}>
                  <UserOutlined /> Chế độ gửi: {isAnonymous ? 'Ẩn danh (Bảo mật)' : 'Công khai danh tính'}
                </b>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {isAnonymous ? 'Thông tin cá nhân của bạn sẽ được giữ kín hoàn toàn.' : 'Cơ quan chức năng có thể liên hệ bạn để xác minh.'}
                </div>
              </Col>
              <Col xs={6} style={{ textAlign: 'right' }}>
                <Switch 
                  checked={isAnonymous} 
                  onChange={(checked) => setIsAnonymous(checked)} 
                  checkedChildren="Ẩn" 
                  unCheckedChildren="Hiện" 
                />
              </Col>
            </Row>

            {/* Form nhập thông tin hiện ra nếu tắt Ẩn danh */}
            {!isAnonymous && (
              <Row gutter={16} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #d9d9d9' }}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Họ và Tên của bạn" name="senderName" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                    <Input placeholder="Nhập họ và tên thật..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Số điện thoại liên hệ" name="phone" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                    <Input prefix={<PhoneOutlined style={{ color: '#bfbfbf' }}/>} placeholder="Nhập số điện thoại..." />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Nhóm vụ việc" name="incidentType" rules={[{ required: true, message: 'Vui lòng chọn!' }]}>
                <Select placeholder="-- Chọn loại vi phạm --">
                  {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.tenDanhMuc}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
  label="Trường học"
  name="school"
  rules={[{ required: true, message: 'Vui lòng chọn trường học!' }]}
>
  <Select 
    placeholder="-- Chọn trường học --" 
    showSearch
    // 👉 THÊM DÒNG NÀY VÀO:
    disabled={!!urlSchoolId} // Khóa ô này lại nếu trên URL có truyền schoolId
  >
    {/* Vòng lặp map danh sách trường học của bạn giữ nguyên */}
    {schools.map(school => (
      <Select.Option key={school.id} value={school.id}>
        {school.tenDonVi}
      </Select.Option>
    ))}
  </Select>
</Form.Item>
            </Col>
          </Row>

          <Form.Item label="Tiêu đề vụ việc" name="title" rules={[{ required: true, message: 'Nhập tiêu đề!' }]}>
            <Input placeholder="Ví dụ: Bạo lực học đường tại cổng trường..." />
          </Form.Item>

          <Form.Item label="Nội dung chi tiết" name="description" rules={[{ required: true, message: 'Mô tả sự việc!' }]}>
            <TextArea rows={3} placeholder="Vui lòng mô tả chi tiết sự việc, đặc điểm nhận dạng..." />
          </Form.Item>

          <Form.Item label="Địa điểm cụ thể" name="location">
            <Input prefix={<EnvironmentOutlined style={{ color: '#bfbfbf' }}/>} placeholder="Số nhà, đường..." />
          </Form.Item>

          <Row align="middle" justify="space-between" style={{ marginBottom: '16px' }}>
            <Col><b style={{ color: '#cf1322' }}>Đánh dấu mức độ Khẩn cấp?</b></Col>
            <Col>
              <Form.Item name="isUrgent" valuePropName="checked" style={{ margin: 0 }}>
                <Switch checkedChildren="CÓ" unCheckedChildren="KHÔNG" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Hình ảnh/Video bằng chứng (Tùy chọn)" 
            name="images" 
            valuePropName="fileList" 
            getValueFromEvent={normFile} 
            style={{ marginBottom: '24px' }}
            >
            <Upload beforeUpload={() => false} listType="picture" multiple>
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loadingForm} block style={{ background: '#e11d48', border: 'none', height: '45px', fontSize: '16px', borderRadius: '6px' }}>
            GỬI THÔNG TIN BÁO CÁO
          </Button>
        </Form>
      </Modal>

      {/* ================= MODAL GỬI PHẢN ÁNH THÀNH CÔNG (HIỆN MÃ TRA CỨU) ================= */}
      <Modal
        open={!!trackingCode}
        onCancel={() => setTrackingCode(null)}
        footer={null}
        centered
        closable={false}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#10b981', marginBottom: '16px' }} />
          <Title level={3} style={{ color: '#0a3055', margin: '0 0 16px 0', fontWeight: 'bold' }}>GỬI PHẢN ÁNH THÀNH CÔNG!</Title>
          
          <Paragraph style={{ fontSize: '15px', color: '#555', marginBottom: '24px' }}>
            Thông tin phản ánh của bạn đã được hệ thống ghi nhận.
          </Paragraph>

          <div style={{ 
            background: '#f0fdf4', border: '2px dashed #10b981', borderRadius: '12px', 
            padding: '24px', marginBottom: '30px' 
          }}>
            <div style={{ fontSize: '14px', color: '#065f46', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
              Mã số tra cứu của bạn:
            </div>
            <div style={{ 
              fontSize: '42px', color: '#047857', fontWeight: '900', letterSpacing: '4px', 
              fontFamily: 'Courier New, monospace', marginBottom: '16px' 
            }}>
              {trackingCode}
            </div>
            <div style={{ fontSize: '13px', color: '#065f46', fontStyle: 'italic' }}>
              * Lưu ý: Hãy chụp màn hình hoặc sao chép mã số này. Đây là mã duy nhất để bạn tra cứu tiến độ xử lý.
            </div>
          </div>

          <Space size="middle">
            <Button 
              size="large" 
              icon={<CopyOutlined />} 
              onClick={() => {
                navigator.clipboard.writeText(trackingCode);
                message.success('Đã sao chép mã tra cứu!');
              }}
            >
              Sao chép mã
            </Button>
            <Button 
              type="primary" 
              size="large" 
              style={{ background: '#0a3055' }}
              onClick={() => setTrackingCode(null)}
            >
              Quay lại Trang chủ
            </Button>
          </Space>
        </div>
      </Modal>

      {/* SIDEBAR VÀ NÚT FILTER MOBILE GIỮ NGUYÊN */}
      {window.innerWidth < 768 && (
        <Button 
          type="primary" 
          shape="circle" 
          icon={<FilterOutlined />} 
          size="large"
          onClick={() => setIsFilterDrawerOpen(true)}
          style={{ 
            position: 'fixed', bottom: '24px', left: '24px', zIndex: 999, 
            background: '#0a3055', border: 'none', width: '50px', height: '50px',
            boxShadow: '0 4px 12px rgba(10, 48, 85, 0.4)'
          }}
        />
      )}

      <Drawer
        title={<div style={{ color: '#0a3055', fontWeight: 'bold' }}><FilterOutlined /> Chọn Chuyên Mục</div>}
        placement="left" 
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        width={260}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filterTags.map(tag => (
            <div
              key={tag}
              onClick={() => {
                setActiveFilter(tag);
                setIsFilterDrawerOpen(false); 
              }}
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #f0f0f0',
                background: activeFilter === tag ? '#e6f7ff' : '#fff',
                color: activeFilter === tag ? '#e11d48' : '#333',
                fontWeight: activeFilter === tag ? 'bold' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </Drawer>

      {/* ================= MODAL TRA CỨU TIẾN ĐỘ XỬ LÝ ================= */}
      <Modal
        title={<div style={{ fontSize: '18px', color: '#0a3055' }}><SearchOutlined /> Tra cứu tiến độ xử lý</div>}
        open={isTrackingModalVisible}
        onCancel={() => setIsTrackingModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        <div style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
          <Input 
            size="large" 
            placeholder="Nhập mã tra cứu (VD: RP-45)..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
            onPressEnter={handleSearchTracking}
          />
          <Button type="primary" size="large" onClick={handleSearchTracking} loading={isSearching} style={{ background: '#0a3055' }}>
            Tìm kiếm
          </Button>
        </div>

        {/* Khối hiển thị khi CÓ KẾT QUẢ */}
        {trackingResult && (
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Title level={4} style={{ marginTop: 0 }}>Thông tin vụ việc: RP-{trackingResult.id}</Title>
            <Paragraph><Text strong>Tiêu đề:</Text> {trackingResult.tieuDe}</Paragraph>
            <Paragraph><Text strong>Đơn vị thụ lý:</Text> <Tag color="blue">{trackingResult.donViXuLy || 'Đang chờ phân công'}</Tag></Paragraph>
            <Paragraph><Text strong>Ngày gửi:</Text> {new Date(trackingResult.ngayGui).toLocaleString('vi-VN')}</Paragraph>
            
            <div style={{ marginTop: '30px', marginBottom: '20px' }}>
              <Steps
                direction="vertical"
                current={
                  trackingResult.trangThai === 'Hoàn thành' ? 2 : 
                  trackingResult.trangThai === 'Đang xử lý' ? 1 : 0
                }
                items={[
                  {
                    title: 'Tiếp nhận thông tin',
                    description: 'Hệ thống đã ghi nhận phản ánh của bạn.',
                  },
                  {
                    title: 'Đang xử lý',
                    description: 'Cơ quan chức năng đang tiến hành xác minh và giải quyết.',
                  },
                  {
                    title: 'Hoàn thành',
                    description: trackingResult.ghiChuKetQua ? `Kết quả: ${trackingResult.ghiChuKetQua}` : 'Vụ việc đã được giải quyết dứt điểm.',
                  },
                ]}
              />
            </div>
          </div>
        )} {/* 👉 Vị trí dấu đóng bị thiếu đã được thêm vào đây */}

        {/* Khối hiển thị khi TÌM KHÔNG RA */}
        {hasSearched && !trackingResult && !isSearching && (
          <div style={{ 
            background: '#fff1f0', border: '1px dashed #ffa39e', padding: '30px 20px', 
            borderRadius: '8px', textAlign: 'center', marginTop: '20px' 
          }}>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#cf1322', fontSize: '15px' }}>
                  <b>Không tìm thấy dữ liệu!</b><br/>
                  Mã tra cứu <Tag color="error" style={{ margin: '5px 0' }}>{searchInput}</Tag> không tồn tại hoặc không hợp lệ.
                </span>
              }
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default PublicPortal;