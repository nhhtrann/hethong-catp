// src/pages/QuanLyDonVi.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, Typography, Modal, Form, Input, message } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const QuanLyDonVi = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 1. GỌI API LẤY DANH SÁCH ĐƠN VỊ KHI MỞ TRANG
  const fetchUnits = () => {
    fetch('http://localhost:3000/units')
      .then(res => res.json())
      .then(result => {
        // Gắn key cho bảng Ant Design
        const formattedData = result.map(item => ({ ...item, key: item.id }));
        setData(formattedData);
      })
      .catch(err => console.error("Lỗi tải đơn vị:", err));
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // 2. GỌI API THÊM ĐƠN VỊ MỚI
  const handleAddUnit = async (values) => {
    try {
      const response = await fetch('http://localhost:3000/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenDonVi: values.tenDonVi,
          nguoiLienHe: values.nguoiLienHe,
          soDienThoai: values.soDienThoai,
          trangThai: 'Hoạt động' // Mặc định khi thêm mới là hoạt động
        })
      });

      if (response.ok) {
        message.success('Đã thêm đơn vị mới thành công!');
        setIsModalVisible(false);
        form.resetFields(); // Xóa trắng form
        fetchUnits(); // Tải lại bảng ngay lập tức
      } else {
        message.error('Lỗi khi thêm đơn vị!');
      }
    } catch (error) {
      console.error(error);
      message.error('Không kết nối được với Server!');
    }
  };

  // 3. CẤU HÌNH CỘT CHO BẢNG
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
    { title: 'Tên đơn vị', dataIndex: 'tenDonVi', key: 'tenDonVi' },
    { title: 'Người liên hệ', dataIndex: 'nguoiLienHe', key: 'nguoiLienHe' },
    { title: 'Số điện thoại', dataIndex: 'soDienThoai', key: 'soDienThoai' },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      render: (trangThai) => (
        <Tag color={trangThai === 'Hoạt động' ? 'green' : 'red'}>
          {trangThai?.toUpperCase() || 'HOẠT ĐỘNG'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Button type="default" icon={<EditOutlined />} size="small">Sửa</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý Đơn vị phối hợp</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Thêm đơn vị mới
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={data} bordered />
      </Card>

      {/* MODAL THÊM ĐƠN VỊ */}
      <Modal
        title="Thêm Đơn vị phối hợp mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()} // Bấm OK sẽ trigger submit form
        okText="Thêm mới"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleAddUnit}>
          <Form.Item name="tenDonVi" label="Tên đơn vị (Công an Phường/Quận)" rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị!' }]}>
            <Input placeholder="Ví dụ: Công an Phường Phú Nhuận" />
          </Form.Item>
          <Form.Item name="nguoiLienHe" label="Người liên hệ (Chỉ huy)">
            <Input placeholder="Ví dụ: Đại úy Lê Văn A" />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại trực ban">
            <Input placeholder="Ví dụ: 0234.38... hoặc 090..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyDonVi;