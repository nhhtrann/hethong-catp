// src/components/ReportDetail.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Typography, Form, Select, Input, Upload, Button, message, Image, Alert, Steps, Collapse, Tag, Avatar, Space } from 'antd';
import { 
  InboxOutlined, EnvironmentOutlined, ClockCircleOutlined, 
  CheckCircleOutlined, SyncOutlined, TeamOutlined, UserOutlined, 
  FileImageOutlined, SolutionOutlined, EditOutlined, DownloadOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Step } = Steps;
const { Panel } = Collapse;

const ReportDetail = ({ visible, onClose, data, onRefresh, mode = 'admin' }) => {
  const [form] = Form.useForm();
  const [units, setUnits] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const isCompleted = data?.trangThai === 'Hoàn thành'; 
  const isPending = data?.trangThai === 'Chờ duyệt'; 

  const disableUnit = mode === 'unit' || isCompleted; 
  const disableResult = (mode === 'unit' && (isCompleted || isPending)) || (mode === 'admin' && isCompleted); 
  const disableStatus = mode === 'unit' || isCompleted; 
  const hideSaveBtn = (mode === 'unit' && (isCompleted || isPending)) || (mode === 'admin' && isCompleted);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    fetch(`${import.meta.env.VITE_API_URL}/units`)
      .then(res => res.json())
      .then(result => Array.isArray(result) && setUnits(result))
      .catch(err => console.error("Lỗi load đơn vị:", err));
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getImageUrl = (imgStr) => {
    if (!imgStr || imgStr === "[]" || imgStr === "null") return null;
    if (String(imgStr).startsWith('http') || String(imgStr).startsWith('data:image') || String(imgStr).startsWith('blob:')) {
      return imgStr;
    }
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    const imagePath = String(imgStr).startsWith('/') ? imgStr : `/${imgStr}`;
    return `${baseUrl}${imagePath}`;
  };

  const getImagesFromArray = (imgData) => {
    if (!imgData || imgData === "[]" || imgData === "null") return [];
    try {
      const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
      return Array.isArray(parsed) ? parsed.filter(i => i) : [imgData];
    } catch (e) {
      return [imgData];
    }
  };

  const anhKiemChungList = getImagesFromArray(data?.anhKiemChung);
  const anhKetQuaData = getImagesFromArray(data?.anhKetQua);

  useEffect(() => {
    if (visible && data) {
      const initialFiles = anhKetQuaData.map((fileName, index) => ({
        uid: `-${index}`,
        name: fileName,
        status: 'done',
        url: getImageUrl(fileName) 
      }));
      setFileList(initialFiles);

      form.setFieldsValue({
        trangThai: mode === 'unit' && data.trangThai !== 'Hoàn thành' && data.trangThai !== 'Chờ duyệt' ? 'Chờ duyệt' : data.trangThai,
        ghiChu: data.ghiChuKetQua || "",
        anhKetQua: initialFiles,
        donViXuLy: data.donViXuLy,
        kinhDo: data.kinhDo || "",
        viDo: data.viDo || ""
      });
    }
  }, [visible, data, form, mode]);

  const handleUploadChange = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.map(file => {
      if (file.status === 'done' && file.response) {
        const uploadedName = file.response.fileName || file.response.filename;
        if (uploadedName) {
          file.name = uploadedName; 
          file.url = getImageUrl(uploadedName);
        }
      }
      return file;
    });
    setFileList(newFileList);
    form.setFieldsValue({ anhKetQua: newFileList }); 
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { message.error('Thiết bị không hỗ trợ GPS!'); return; }
    setIsFetchingLocation(true);
    message.loading({ content: 'Đang kết nối GPS...', key: 'gps' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setFieldsValue({ kinhDo: position.coords.longitude.toString(), viDo: position.coords.latitude.toString() });
        setIsFetchingLocation(false);
        message.success({ content: 'Đã lấy được tọa độ!', key: 'gps', duration: 2 });
      },
      (error) => { setIsFetchingLocation(false); message.error({ content: 'Lỗi GPS. Hãy bật Vị trí!', key: 'gps', duration: 4 }); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 👉 BƯỚC SỬA LỖI NẰM Ở HÀM NÀY: Khôi phục logic an toàn cho Kinh độ/Vĩ độ và in lỗi chi tiết
  const handleLuuBaoCao = async (values) => {
    try {
      let finalAnh = data.anhKetQua; 
      if (!disableResult) { 
        const currentFiles = values.anhKetQua || [];
        const fileNamesOnly = currentFiles.map(f => f.name).filter(name => name); 
        finalAnh = JSON.stringify(fileNamesOnly);
      }

      const payloadData = {
        trangThai: mode === 'unit' ? 'Chờ duyệt' : values.trangThai,
        donViXuLy: disableUnit ? data.donViXuLy : values.donViXuLy || "",
        ghiChuKetQua: disableResult ? (data.ghiChuKetQua) : values.ghiChu || "",
        anhKetQua: finalAnh,
      };

      // Xử lý an toàn tọa độ để Backend không báo lỗi
      let finalKinhDo = disableResult ? data.kinhDo : (values.kinhDo || data.kinhDo);
      let finalViDo = disableResult ? data.viDo : (values.viDo || data.viDo);

      if (finalKinhDo !== "" && finalKinhDo !== null && finalKinhDo !== undefined) {
        payloadData.kinhDo = String(finalKinhDo);
      }
      if (finalViDo !== "" && finalViDo !== null && finalViDo !== undefined) {
        payloadData.viDo = String(finalViDo);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData)
      });

      if (response.ok) { 
        message.success('Cập nhật thành công!'); 
        if (onRefresh) onRefresh(); 
        onClose(); 
      } else { 
        // 👉 ĐÃ SỬA: Bắt Backend in ra lỗi cụ thể
        const errorData = await response.json();
        const errorMsg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        message.error(`Từ chối cập nhật: ${errorMsg || 'Kiểm tra lại dữ liệu'}`); 
        console.error("Chi tiết lỗi Backend:", errorData);
      }
    } catch (error) { 
      message.error('Lỗi kết nối máy chủ!'); 
    }
  };

  const getSteps = () => [
    { title: 'Tiếp nhận', status: 'finish', icon: <CheckCircleOutlined /> },
    { 
      title: 'Đang xử lý', 
      status: (isCompleted || isPending) ? 'finish' : 'process', 
      icon: (isCompleted || isPending) ? <CheckCircleOutlined /> : <SyncOutlined spin /> 
    },
    { 
      title: 'Hoàn thành', 
      status: isCompleted ? 'finish' : 'wait', 
      icon: isCompleted ? <CheckCircleOutlined /> : <ClockCircleOutlined /> 
    },
  ];

  if (!data) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '20px' }}>
          <Title level={4} style={{ margin: 0 }}>Vụ việc: {data.tieuDe || "N/A"}</Title>
          <Tag color={isCompleted ? 'green' : isPending ? 'blue' : 'volcano'}>{data.trangThai?.toUpperCase()}</Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={isMobile ? '100%' : 900}
      footer={null}
      centered
      styles={{ body: { padding: isMobile ? '10px' : '20px' }, mask: { zIndex: 1000 }, wrapper: { zIndex: 1001 } }}
    >
      {isCompleted && <Alert message="Hồ sơ đã hoàn thành và chốt số liệu, không thể sửa đổi." type="error" showIcon style={{ marginBottom: 16 }} />}

      <Form form={form} layout="vertical" onFinish={handleLuuBaoCao}>
        <Collapse bordered={false} defaultActiveKey={['1', '2', '3']} expandIconPosition="end" style={{ background: 'transparent' }}>
          
          {/* ================= GIAI ĐOẠN 1: TỔNG QUAN & TIẾP NHẬN ================= */}
          <Panel 
            header={<b>1. Thông tin ban đầu & Tiếp nhận</b>} 
            key="1" 
            extra={!isMobile && <Steps size="small" current={0} items={getSteps()} style={{ minWidth: '300px' }}/>}
            style={{ marginBottom: 12, border: '1px solid #d9d9d9', borderRadius: '8px', background: '#fff', overflow: 'hidden' }}
          >
            <div style={{ padding: '0 10px' }}>
              <p><Text type="secondary"><ClockCircleOutlined /> Thời gian gửi:</Text> <b>{data.ngayGui ? new Date(data.ngayGui).toLocaleString('vi-VN') : "N/A"}</b></p>
              <Space align="start" style={{ marginBottom: 12 }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ccc' }} />
                <div>
                  <Text strong>{data.nguoiGui?.fullName || data.sdtNguoiGui || "Người dân ẩn danh"}</Text>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{data.sdtNguoiGui ? `SĐT: ${data.sdtNguoiGui}` : data.nguoiGui?.email || ""}</p>
                </div>
              </Space>
              
              <Paragraph style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginTop: 10 }}>
                <b style={{ color: '#555' }}>Nội dung phản ánh:</b><br/> {data.noiDung || "N/A"}
              </Paragraph>

              {anhKiemChungList.length > 0 && (
                <>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}><FileImageOutlined /> Ảnh minh chứng từ người dân:</Text>
                  <Image.PreviewGroup>
                    <Row gutter={[8, 8]}>
                      {anhKiemChungList.map((tenFile, index) => (
                        <Col key={index} xs={12} sm={8} md={6}>
                          <Image 
                            src={getImageUrl(tenFile)} 
                            style={{ width: '100%', height: isMobile ? '80px' : '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                            fallback="https://via.placeholder.com/150?text=Lỗi+ảnh" 
                          />
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </>
              )}
            </div>
          </Panel>

          {/* ================= GIAI ĐOẠN 2: PHÂN CÔNG & XỬ LÝ ================= */}
          <Panel 
            header={<b>2. Phân công & Xử lý</b>} 
            key="2" 
            style={{ marginBottom: 12, border: '1px solid #d9d9d9', borderRadius: '8px', background: '#fff', overflow: 'hidden' }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="donViXuLy" label={<Text strong><TeamOutlined /> Đơn vị được phân công</Text>}>
                  <Select disabled={disableUnit} placeholder="-- Chọn Đơn vị --">
                    {units.map(u => <Option key={u.id} value={u.tenDonVi}>{u.tenDonVi}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="trangThai" label={<Text strong><ClockCircleOutlined /> Trạng thái xử lý</Text>}>
                  <Select disabled={disableStatus}>
                    <Option value="Mới">Mới</Option>
                    <Option value="Đang xử lý">Đang xử lý</Option>
                    <Option value="Chờ duyệt">Chờ duyệt</Option>
                    <Option value="Hoàn thành">Hoàn thành</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {mode === 'admin' && hideSaveBtn && (
              <Alert message="Để cập nhật lại Ghi chú hoặc Ảnh, hãy chuyển Trạng thái về 'Đang xử lý'." type="info" size="small" showIcon style={{marginBottom: 10}}/>
            )}
          </Panel>

          {/* ================= GIAI ĐOẠN 3: KẾT QUẢ ================= */}
          <Panel 
            header={<b>3. Kết quả xử lý dứt điểm</b>} 
            key="3" 
            style={{ marginBottom: hideSaveBtn ? 0 : 12, border: '1px solid #d9d9d9', borderRadius: '8px', background: '#fff', overflow: 'hidden' }}
          >
            <Form.Item name="ghiChu" label={<Text strong><SolutionOutlined /> Ghi chú/Nội dung báo cáo kết quả</Text>}>
              <TextArea rows={3} disabled={disableResult} placeholder="Nhập nội dung báo cáo chi tiết kết quả xử lý..." style={{ borderRadius: '6px' }}/>
            </Form.Item>

            <div style={{ padding: '12px', backgroundColor: '#f0f5ff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #d6e4ff' }}>
              <Row gutter={16} align="middle">
                <Col xs={24} sm={10} style={{ marginBottom: isMobile ? 8 : 0 }}>
                  <Text strong style={{ color: '#005bac' }}><EnvironmentOutlined /> Vị trí xử lý thực tế:</Text>
                </Col>
                {!disableResult && (
                  <Col xs={24} sm={14} style={{ textAlign: isMobile ? 'left' : 'right', marginBottom: isMobile ? 12 : 0 }}>
                    <Button type="primary" size="small" icon={<EnvironmentOutlined />} onClick={handleGetLocation} loading={isFetchingLocation} style={{ backgroundColor: '#1890ff', borderRadius: '4px', width: isMobile ? '100%' : 'auto' }}>
                      Lấy vị trí hiện tại
                    </Button>
                  </Col>
                )}
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col xs={12} sm={12}>
                  <Form.Item name="kinhDo" label={<Text type="secondary" style={{ fontSize: 12 }}>Kinh độ</Text>} style={{ marginBottom: 0 }}>
                    <Input placeholder="0.0" disabled={disableResult} style={{ borderRadius: '4px' }}/>
                  </Form.Item>
                </Col>
                <Col xs={12} sm={12}>
                  <Form.Item name="viDo" label={<Text type="secondary" style={{ fontSize: 12 }}>Vĩ độ</Text>} style={{ marginBottom: 0 }}>
                    <Input placeholder="0.0" disabled={disableResult} style={{ borderRadius: '4px' }}/>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Form.Item name="anhKetQua" label={<Text strong><FileImageOutlined /> Ảnh minh chứng kết quả (Upload lại hoặc bổ sung)</Text>}>
              <Dragger name="file" action={`${import.meta.env.VITE_API_URL}/upload`} multiple disabled={disableResult} listType="picture" fileList={fileList} onChange={handleUploadChange} style={{ background: '#fff', borderRadius: '8px' }}>
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">{disableResult ? "Không thể tải ảnh khi đã chốt hồ sơ" : "Kéo thả ảnh báo cáo"}</p>
              </Dragger>
            </Form.Item>
          </Panel>
        </Collapse>

        {/* Nút thao tác dưới đáy nằm bên trong Form */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Button onClick={onClose} icon={<DownloadOutlined rotate={180}/>} >Đóng chi tiết</Button>
          {!hideSaveBtn && <Button type="primary" htmlType="submit" icon={<EditOutlined/>} style={{ backgroundColor: '#10b981', border: 'none' }}>Lưu & Cập nhật</Button>}
        </div>
      </Form>
    </Modal>
  );
};

export default ReportDetail;