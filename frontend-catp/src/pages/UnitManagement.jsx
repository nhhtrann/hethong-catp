// src/pages/UnitManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Form, Input, Select, Space, Popconfirm, message, Tag } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, BankOutlined, PhoneOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UnitManagement = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editForm] = Form.useForm();

  const fetchUnits = () => {
    fetch('http://localhost:3000/units')
      .then(res => res.json())
      .then(result => {
        const formattedData = result.map(item => ({ ...item, key: item.id }));
        setData(formattedData);
      })
      .catch(err => console.error("Lỗi tải đơn vị:", err));
  };

  useEffect(() => { fetchUnits(); }, []);

  const handleAddUnit = async (values) => {
    try {
      const response = await fetch('http://localhost:3000/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, trangThai: 'Hoạt động' })
      });
      if (response.ok) {
        message.success('Thêm đơn vị thành công!');
        setIsModalVisible(false);
        form.resetFields();
        fetchUnits();
      }
    } catch (error) { message.error('Lỗi kết nối Server!'); }
  };

  const handleDeleteUnit = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/units/${id}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Đã xóa đơn vị!');
        fetchUnits();
      }
    } catch (error) { message.error('Lỗi khi xóa!'); }
  };

  const handleUpdateUnit = async (values) => {
    try {
      const response = await fetch(`http://localhost:3000/units/${editingUnit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      if (response.ok) {
        message.success('Cập nhật thành công!');
        setIsEditModalVisible(false);
        fetchUnits();
      }
    } catch (error) { message.error('Lỗi kết nối Server!'); }
  };

  const columns = [
    { 
      title: 'STT', 
      key: 'stt', 
      width: 70, 
      align: 'center', 
      render: (_, __, index) => <span style={{ color: '#94a3b8', fontWeight: 500 }}>{index + 1}</span> 
    },
    { 
      title: 'Tên đơn vị', 
      dataIndex: 'tenDonVi', 
      key: 'tenDonVi',
      render: (text) => <Text strong style={{ color: '#334155', fontSize: '14px' }}>{text}</Text>
    },
    { 
      title: 'Người liên hệ', 
      dataIndex: 'nguoiLienHe', 
      key: 'nguoiLienHe',
      render: (text) => <span style={{ color: '#475569' }}>{text || '---'}</span>
    },
    { 
      title: 'Số điện thoại', 
      dataIndex: 'soDienThoai', 
      key: 'soDienThoai',
      render: (text) => (
        <Space style={{ color: '#0284c7', fontWeight: 500 }}>
          <PhoneOutlined style={{ fontSize: '12px' }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      width: 160,
      align: 'center',
      render: (val) => {
        const text = val ? val.toUpperCase() : 'HOẠT ĐỘNG';
        const isActive = text.includes('HOẠT ĐỘNG');
        return (
          <Tag 
            color={isActive ? 'success' : 'error'}
            style={{ 
              borderRadius: '20px', // Dạng viên thuốc cực đẹp
              padding: '2px 15px',
              fontWeight: 700,
              fontSize: '11px',
              border: 'none',
              textTransform: 'uppercase'
            }}
          >
            {isActive ? 'Hoạt động' : 'Tạm ngưng'}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} style={{ color: '#6366f1' }} onClick={() => {
            setEditingUnit(record);
            editForm.setFieldsValue(record);
            setIsEditModalVisible(true);
          }} />
          <Popconfirm title="Xóa đơn vị này?" onConfirm={() => handleDeleteUnit(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Quản lý Đơn vị phối hợp
          </Title>
          <Text type="secondary">Quản lý danh sách các cơ quan chức năng hỗ trợ điều phối.</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => setIsModalVisible(true)}
          style={{ borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 6px rgba(24, 144, 255, 0.2)' }}
        >
          Thêm đơn vị
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 800 }}
          pagination={{ pageSize: 8 }}
          size="large" // Tăng size cho bảng nhìn thoáng
        />
      </Card>

      {/* Modal Thêm */}
      <Modal title="Thêm Đơn vị mới" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} centered>
        <Form form={form} layout="vertical" onFinish={handleAddUnit} style={{ marginTop: '10px' }}>
          <Form.Item name="tenDonVi" label="Tên đơn vị" rules={[{ required: true }]}><Input placeholder="Công an Phường..." /></Form.Item>
          <Form.Item name="nguoiLienHe" label="Người liên hệ"><Input placeholder="Họ và tên" /></Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại"><Input placeholder="0234..." /></Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa */}
      <Modal title="Cập nhật Đơn vị" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} onOk={() => editForm.submit()} centered>
        <Form form={editForm} layout="vertical" onFinish={handleUpdateUnit} style={{ marginTop: '10px' }}>
          <Form.Item name="tenDonVi" label="Tên đơn vị" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="nguoiLienHe" label="Người liên hệ"><Input /></Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại"><Input /></Form.Item>
          <Form.Item name="trangThai" label="Trạng thái">
            <Select options={[{ label: 'Hoạt động', value: 'Hoạt động' }, { label: 'Tạm ngưng', value: 'Tạm ngưng' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UnitManagement;