// src/components/ReportDetail.jsx
import React, { useState, useEffect } from 'react';
import { InboxOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Modal, Row, Col, Typography, Form, Select, Input, Upload, Button, message, Image, Alert, Tag } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const ReportDetail = ({ visible, onClose, data, mode = 'admin' }) => {
  const [form] = Form.useForm();
  const [units, setUnits] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const isCompleted = data?.trangThai === 'Hoàn thành'; 
  const isPending = data?.trangThai === 'Chờ duyệt'; 

  const disableUnit = mode === 'unit' || isCompleted; 
  const disableResult = (mode === 'unit' && (isCompleted || isPending)) || (mode === 'admin' && isCompleted); 
  const disableStatus = mode === 'unit' || isCompleted; 
  const hideSaveBtn = (mode === 'unit' && (isCompleted || isPending)) || (mode === 'admin' && isCompleted);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/units`)
      .then(res => res.json())
      .then(result => Array.isArray(result) && setUnits(result))
      .catch(err => console.error("Lỗi load đơn vị:", err));
  }, []);

  useEffect(() => {
    if (visible && data) {
      let initialFiles = [];
      if (data.anhKetQua && data.anhKetQua !== 'null' && data.anhKetQua !== '[]') {
        try {
          const parsed = typeof data.anhKetQua === 'string' ? JSON.parse(data.anhKetQua) : data.anhKetQua;
          if (Array.isArray(parsed)) {
            initialFiles = parsed
              .filter(fileName => fileName && fileName !== 'null')
              .map((fileName, index) => ({
                uid: `-${index}`,
                name: fileName,
                status: 'done',
                url: String(fileName).startsWith('http') ? fileName : `${import.meta.env.VITE_API_URL}/uploads/${fileName}`
              }));
          }
        } catch (error) {
          if (data.anhKetQua !== 'null') {
            initialFiles = [{
              uid: '-1',
              name: data.anhKetQua,
              status: 'done',
              url: String(data.anhKetQua).startsWith('http') ? data.anhKetQua : `${import.meta.env.VITE_API_URL}/uploads/${data.anhKetQua}`
            }];
          }
        }
      }
      setFileList(initialFiles);

      form.setFieldsValue({
        trangThai: mode === 'unit' && data.trangThai !== 'Hoàn thành' && data.trangThai !== 'Chờ duyệt' 
                   ? 'Chờ duyệt' : data.trangThai,
        ghiChu: data.ghiChu || data.ghiChuKetQua || "",
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
          file.url = `${import.meta.env.VITE_API_URL}/uploads/${uploadedName}`;
        }
      }
      return file;
    });
    setFileList(newFileList);
    form.setFieldsValue({ anhKetQua: newFileList }); 
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      message.error('Trình duyệt hoặc thiết bị của bạn không hỗ trợ định vị GPS!');
      return;
    }
    
    setIsFetchingLocation(true);
    message.loading({ content: 'Đang kết nối vệ tinh để lấy tọa độ...', key: 'gps' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setFieldsValue({
          kinhDo: position.coords.longitude.toString(),
          viDo: position.coords.latitude.toString()
        });
        setIsFetchingLocation(false);
        message.success({ content: 'Đã lấy được tọa độ hiện tại!', key: 'gps', duration: 2 });
      },
      (error) => {
        setIsFetchingLocation(false);
        console.error("Lỗi GPS: ", error);
        message.error({ content: 'Không thể lấy tọa độ. Vui lòng bật Dịch vụ Vị trí (Location) và cấp quyền cho trình duyệt!', key: 'gps', duration: 4 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleLuuBaoCao = async (values) => {
    try {
      const finalDonVi = disableUnit ? data.donViXuLy : values.donViXuLy;
      const finalGhiChu = disableResult ? (data.ghiChu || data.ghiChuKetQua) : values.ghiChu;
      
      let finalAnh = data.anhKetQua; 
      if (!disableResult) { 
        const currentFiles = values.anhKetQua || [];
        const fileNamesOnly = currentFiles
          .map(f => f.name)
          .filter(name => name != null && name !== 'null'); 
          
        finalAnh = JSON.stringify(fileNamesOnly);
      }

      const finalStatus = mode === 'unit' ? 'Chờ duyệt' : values.trangThai;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trangThai: finalStatus,
          donViXuLy: finalDonVi || "",
          ghiChuKetQua: finalGhiChu || "",
          anhKetQua: finalAnh,
          kinhDo: disableResult ? data.kinhDo : values.kinhDo,
          viDo: disableResult ? data.viDo : values.viDo 
        })
      });

      if (response.ok) {
        message.success('Cập nhật thành công!');
        onClose();
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error) {
      message.error('Lỗi kết nối máy chủ!');
    }
  };

  // 👉 LÁ CHẮN QUAN TRỌNG: Chặn đứng lỗi màn hình trắng nếu data chưa kịp load
  if (!data) return null;

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>Chi tiết: {data.tieuDe || "N/A"}</Title>}
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
      centered
    >
      {isCompleted && <Alert message="Hồ sơ đã hoàn thành, không thể sửa đổi." type="error" showIcon style={{ marginBottom: 16 }} />}
      {mode === 'unit' && isPending && !isCompleted && <Alert message="Bạn đã nộp báo cáo. Đang chờ Ban Tiếp Nhận CATP phê duyệt chốt sổ." type="info" showIcon style={{ marginBottom: 16 }} />}
      {mode === 'admin' && isPending && !isCompleted && <Alert message="Cơ quan đã gửi kết quả. Bạn có thể chỉnh sửa lại Ghi chú & Ảnh trước khi chọn 'Hoàn thành' để chốt sổ." type="warning" showIcon style={{ marginBottom: 16 }} />}

      <Row gutter={24}>
        <Col span={10} style={{ borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
          <p><Text strong>Thời gian gửi:</Text> {data.ngayGui || "N/A"}</p>
          <Text strong>Nội dung phản ánh:</Text>
          <Paragraph style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
            {data.noiDung || "Không có nội dung mô tả."}
          </Paragraph>
          
          <Text strong>Ảnh minh chứng từ người dân:</Text>
          <div style={{ marginTop: 10 }}>
             {(() => {
               // Xử lý an toàn tuyệt đối hình ảnh đầu vào
               if (!data.anhKiemChung || data.anhKiemChung === "[]" || data.anhKiemChung === "null") {
                 return (
                   <div style={{ padding: '20px', background: '#f5f5f5', textAlign: 'center', borderRadius: '8px' }}>
                      <Text type="secondary">Người dân không gửi ảnh kèm theo</Text>
                   </div>
                 );
               }

               let imgArray = [];
               try {
                 imgArray = typeof data.anhKiemChung === 'string' ? JSON.parse(data.anhKiemChung) : data.anhKiemChung;
                 if (!Array.isArray(imgArray)) imgArray = [data.anhKiemChung];
               } catch (error) { 
                 imgArray = [data.anhKiemChung]; 
               }

               return imgArray.map((tenFile, index) => (
                 <Image 
                  key={index}
                  width="100%" 
                  src={String(tenFile).startsWith('http') ? tenFile : `${import.meta.env.VITE_API_URL}/uploads/${tenFile}`} 
                  style={{ borderRadius: '8px', border: '1px solid #ddd', maxHeight: '300px', objectFit: 'contain', marginBottom: '8px' }}
                  fallback="https://via.placeholder.com/200?text=Lỗi+ảnh" 
                 />
               ));
             })()}
          </div>
        </Col>

        <Col span={14}>
          <Form form={form} layout="vertical" onFinish={handleLuuBaoCao}>
            <Form.Item name="trangThai" label="Trạng thái xử lý">
              <Select disabled={disableStatus}>
                <Option value="Mới">Mới</Option>
                <Option value="Đang xử lý">Đang xử lý</Option>
                <Option value="Chờ duyệt">Chờ duyệt</Option>
                <Option value="Hoàn thành">Hoàn thành</Option>
              </Select>
            </Form.Item>

            <Form.Item name="donViXuLy" label="Đơn vị được phân công">
              <Select disabled={disableUnit}>
                {units.map(u => <Option key={u.id} value={u.tenDonVi}>{u.tenDonVi}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="ghiChu" label="Ghi chú/Kết quả xử lý">
              <TextArea rows={3} disabled={disableResult} placeholder="Nhập nội dung báo cáo kết quả..." />
            </Form.Item>

            {/* 👉 KHU VỰC ĐIỀN TỌA ĐỘ VÀ NÚT LẤY GPS */}
            <div style={{ padding: '12px', backgroundColor: '#f0f5ff', borderRadius: '8px', marginBottom: '16px', border: '1px solid #d6e4ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text strong style={{ color: '#005bac' }}>Vị trí xử lý thực tế:</Text>
                {!disableResult && (
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<EnvironmentOutlined />} 
                    onClick={handleGetLocation} 
                    loading={isFetchingLocation}
                    style={{ backgroundColor: '#1890ff' }}
                  >
                    Lấy vị trí hiện tại
                  </Button>
                )}
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    name="kinhDo" 
                    label="Kinh độ"
                    style={{ marginBottom: 0 }}
                    
                  >
                    <Input placeholder="Ví dụ: 0.0" disabled={disableResult} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    name="viDo" 
                    label="Vĩ độ"
                    style={{ marginBottom: 0 }}
                   
                  >
                    <Input placeholder="Ví dụ: 0.0" disabled={disableResult} />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            <Form.Item name="anhKetQua" label="Ảnh minh chứng kết quả">
              <Dragger 
                name="file" 
                action={`${import.meta.env.VITE_API_URL}/upload`} 
                multiple 
                disabled={disableResult}
                listType="picture"
                fileList={fileList}
                onChange={handleUploadChange}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">{disableResult ? "Đã khóa tải ảnh" : "Kéo thả ảnh báo cáo vào đây"}</p>
              </Dragger>
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button onClick={onClose}>Đóng</Button>
              {!hideSaveBtn && <Button type="primary" htmlType="submit" style={{ backgroundColor: '#10b981' }}>Lưu thông tin</Button>}
            </div>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

export default ReportDetail;