// src/components/ReportDetail.jsx
import React, { useState, useEffect } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Modal, Row, Col, Typography, Form, Select, Input, Upload, Button, message, Image, Alert, Tag } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const ReportDetail = ({ visible, onClose, data, mode = 'admin' }) => {
  const [form] = Form.useForm();
  const [units, setUnits] = useState([]);
  const [fileList, setFileList] = useState([]);

  const isCompleted = data?.trangThai === 'Hoàn thành'; 
  const isPending = data?.trangThai === 'Chờ duyệt'; 

  const disableUnit = mode === 'unit' || isCompleted; 
  const disableResult = (mode === 'unit' && (isCompleted || isPending)) || (mode === 'admin' && isCompleted); 
  const disableStatus = mode === 'unit' || isCompleted; 
  const hideSaveBtn = (mode === 'unit' && (isCompleted || isPending)) || (mode === 'admin' && isCompleted);

  useEffect(() => {
    fetch('http://localhost:3000/units')
      .then(res => res.json())
      .then(result => Array.isArray(result) && setUnits(result))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (data && visible) {
      let initialFiles = [];
      if (data.anhKetQua && data.anhKetQua !== "[]" && data.anhKetQua !== "null") {
        try {
          const parsed = JSON.parse(data.anhKetQua);
          if (Array.isArray(parsed)) {
            // LỌC RÁC: Bỏ qua những file bị null từ trước
            initialFiles = parsed
              .filter(fileName => fileName && fileName !== 'null')
              .map((fileName, index) => ({
                uid: `-${index}`,
                name: fileName,
                status: 'done',
                url: String(fileName).startsWith('http') ? fileName : `http://localhost:3000/uploads/${fileName}`
              }));
          }
        } catch (error) {
          if (data.anhKetQua !== 'null') {
            initialFiles = [{
              uid: '-1',
              name: data.anhKetQua,
              status: 'done',
              url: String(data.anhKetQua).startsWith('http') ? data.anhKetQua : `http://localhost:3000/uploads/${data.anhKetQua}`
            }];
          }
        }
      }
      setFileList(initialFiles);
      form.setFieldsValue({
        trangThai: mode === 'unit' && !isCompleted && !isPending ? 'Chờ duyệt' : data.trangThai,
        ghiChu: data.ghiChu || data.ghiChuKetQua || "",
        anhKetQua: initialFiles,
        donViXuLy: data.donViXuLy
      });
    }
  }, [data, visible, form, mode]);

  // HÀM BẮT SỰ KIỆN UPLOAD ĐÃ ĐƯỢC NÂNG CẤP SIÊU CHẮC CHẮN
  const handleUploadChange = (info) => {
    let newFileList = [...info.fileList];

    newFileList = newFileList.map(file => {
      // CHỈ xử lý khi file đã upload XONG (Tránh lấy nhầm lúc đang tải)
      if (file.status === 'done' && file.response) {
        // Dự phòng Backend trả về "fileName" (chữ N hoa) hoặc "filename" (chữ n thường)
        const uploadedName = file.response.fileName || file.response.filename;
        if (uploadedName) {
          file.name = uploadedName; 
          file.url = `http://localhost:3000/uploads/${uploadedName}`;
        }
      }
      return file;
    });

    setFileList(newFileList);
    form.setFieldsValue({ anhKetQua: newFileList }); 
  };

  const handleLuuBaoCao = async (values) => {
    if (!data?.id) return message.error("Không tìm thấy ID vụ việc!");
    try {
      const finalDonVi = disableUnit ? data.donViXuLy : values.donViXuLy;
      const finalGhiChu = disableResult ? (data.ghiChu || data.ghiChuKetQua) : values.ghiChu;
      
      let finalAnh = data.anhKetQua; 
      if (!disableResult) { 
        const currentFiles = values.anhKetQua || [];
        // LỌC RÁC LẦN CUỐI: Đảm bảo không bao giờ lưu chữ null vào SQL nữa
        const fileNamesOnly = currentFiles
          .map(f => f.name)
          .filter(name => name != null && name !== 'null'); 
          
        finalAnh = JSON.stringify(fileNamesOnly);
      }

      const finalStatus = mode === 'unit' ? 'Chờ duyệt' : values.trangThai;

      const response = await fetch(`http://localhost:3000/reports/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trangThai: finalStatus,
          donViXuLy: finalDonVi || "",
          ghiChuKetQua: finalGhiChu || "",
          anhKetQua: finalAnh
        })
      });

      if (response.ok) {
        message.success(mode === 'unit' ? 'Đã gửi lên Ban CATP phê duyệt!' : 'Cập nhật dữ liệu thành công!');
        onClose();
        setTimeout(() => window.location.reload(), 500);
      } else {
        message.error(`Lỗi cập nhật!`);
      }
    } catch (error) {
      message.error('Lỗi kết nối tới Backend!');
    }
  };

  if (!data) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Title level={4} style={{ margin: 0 }}>Chi tiết: {data.tieuDe}</Title>
          {mode === 'admin' ? <Tag color="volcano">Quyền: Ban TN CATP</Tag> : <Tag color="cyan">Quyền: Đơn vị xử lý</Tag>}
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      centered
    >
      {isCompleted && <Alert message="Hồ sơ đã chốt kết quả, khóa mọi chức năng chỉnh sửa." type="error" showIcon style={{ marginBottom: 16 }} />}
      {mode === 'unit' && isPending && !isCompleted && <Alert message="Bạn đã nộp báo cáo. Đang chờ Ban Tiếp Nhận CATP phê duyệt chốt sổ." type="info" showIcon style={{ marginBottom: 16 }} />}
      {mode === 'admin' && isPending && !isCompleted && <Alert message="Cơ quan đã gửi kết quả. Bạn có thể chỉnh sửa lại Ghi chú & Ảnh trước khi chọn 'Hoàn thành' để chốt sổ." type="warning" showIcon style={{ marginBottom: 16 }} />}

      <Row gutter={24}>
        <Col span={12} style={{ borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
          <p><Text strong>Thời gian gửi:</Text> {data.ngayGui}</p>
          <p><Text strong>Nội dung chi tiết từ người dân:</Text></p>
          <Paragraph style={{ backgroundColor: '#f9fafb', padding: '10px', borderRadius: '4px' }}>
            {data.noiDung || "Chưa có nội dung mô tả."}
          </Paragraph>
          <p><Text strong>Ảnh minh chứng từ người gửi:</Text></p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(() => {
              if (!data.anhKiemChung || data.anhKiemChung === "[]" || data.anhKiemChung === "null") {
                return <Text type="secondary">Người dân không đính kèm ảnh.</Text>;
              }
              let imgArray = [];
              try {
                const parsed = JSON.parse(data.anhKiemChung);
                imgArray = Array.isArray(parsed) ? parsed : [data.anhKiemChung];
              } catch (error) { imgArray = [data.anhKiemChung]; }

              return imgArray.map((tenFile, index) => (
                <Image
                  key={index} width={100} height={100} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid #d9d9d9' }}
                  src={tenFile.startsWith('http') ? tenFile : `http://localhost:3000/uploads/${tenFile}`}
                  fallback="https://via.placeholder.com/100?text=Lỗi+ảnh"
                />
              ));
            })()}
          </div>
        </Col>

        <Col span={12} style={{ paddingLeft: 16 }}>
          <Form form={form} layout="vertical" onFinish={handleLuuBaoCao}>
            <Form.Item name="trangThai" label="Trạng thái xử lý">
              <Select disabled={disableStatus}>
                <Option value="Mới" disabled>Mới</Option>
                <Option value="Đang xử lý">Đang xử lý</Option>
                <Option value="Chờ duyệt">Chờ duyệt</Option>
                <Option value="Hoàn thành">Hoàn thành</Option>
              </Select>
            </Form.Item>

            <Form.Item name="donViXuLy" label="Phân công Đơn vị:">
              <Select placeholder="Chọn đơn vị" disabled={disableUnit}>
                {units.map(u => <Option key={u.id} value={u.tenDonVi}>{u.tenDonVi}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="ghiChu" label="Ghi chú kết quả">
              <TextArea rows={4} disabled={disableResult} />
            </Form.Item>

            <Form.Item name="anhKetQua" label="Ảnh minh chứng kết quả">
              <Dragger 
                name="file" 
                action="http://localhost:3000/upload" 
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