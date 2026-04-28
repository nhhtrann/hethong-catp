// src/pages/QuanLyDonVi.jsx
import React, { useState, useEffect } from 'react';
// Đã bổ sung Space, Popconfirm, Select
import { Table, Tag, Button, Card, Typography, Modal, Form, Input, Select, Space, Popconfirm, message } from 'antd';
// Đã bổ sung DeleteOutlined
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const QuanLyDonVi = () => {
  const [data, setData] = useState([]);
  
  // State cho Modal Thêm mới
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // State cho Modal Sửa
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editForm] = Form.useForm();

  // 1. GỌI API LẤY DANH SÁCH ĐƠN VỊ KHI MỞ TRANG
  const fetchUnits = () => {
    fetch('http://localhost:3000/units')
      .then(res => res.json())
      .then(result => {
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
          trangThai: 'Hoạt động'
        })
      });

      if (response.ok) {
        message.success('Đã thêm đơn vị mới thành công!');
        setIsModalVisible(false);
        form.resetFields(); 
        fetchUnits(); 
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Lỗi khi thêm đơn vị!');
      }
    } catch (error) {
      console.error(error);
      message.error('Không kết nối được với Server!');
    }
  };

  // 3. HÀM XÓA ĐƠN VỊ
  const handleDeleteUnit = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/units/${id}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Đã xóa đơn vị thành công!');
        fetchUnits();
      }
    } catch (error) {
      message.error('Lỗi kết nối khi xóa!');
    }
  };

  // 4. HÀM LƯU CẬP NHẬT (SỬA)
  const handleUpdateUnit = async (values) => {
    try {
      const response = await fetch(`http://localhost:3000/units/${editingUnit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Cập nhật đơn vị thành công!');
        setIsEditModalVisible(false);
        fetchUnits();
      } else {
        const errorData = await response.json();
        message.error(errorData.message || 'Lỗi khi cập nhật!');
      }
    } catch (error) {
      message.error('Lỗi kết nối Server!');
    }
  };

  // 5. MỞ MODAL SỬA VÀ ĐỔ DỮ LIỆU CŨ VÀO
  const openEditModal = (record) => {
    setEditingUnit(record);
    editForm.setFieldsValue(record); 
    setIsEditModalVisible(true);
  };

  // 6. CẤU HÌNH CỘT CHO BẢNG
  const columns = [
    { 
      title: 'STT', 
      key: 'stt', 
      width: 60, 
      align: 'center', 
      render: (text, record, index) => index + 1 
    },
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
      render: (_, record) => (
        <Space>
          <Button type="default" icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          
          <Popconfirm 
            title="Bạn có chắc chắn muốn xóa đơn vị này?" 
            onConfirm={() => handleDeleteUnit(record.id)}
            okText="Xóa" 
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
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
        onOk={() => form.submit()} 
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

      {/* MODAL SỬA ĐƠN VỊ */}
      <Modal
        title="Cập nhật thông tin Đơn vị"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateUnit}>
          <Form.Item name="tenDonVi" label="Tên đơn vị" rules={[{ required: true, message: 'Tên không được để trống' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nguoiLienHe" label="Người liên hệ (Chỉ huy)">
            <Input />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="trangThai" label="Trạng thái hoạt động">
            <Select>
              <Select.Option value="Hoạt động">Hoạt động</Select.Option>
              <Select.Option value="Tạm ngưng">Tạm ngưng</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyDonVi;