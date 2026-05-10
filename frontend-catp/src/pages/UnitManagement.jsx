// src/pages/UnitManagement.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, Typography, Modal, Form, Input, Select, Space, message } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;

const UnitManagement = () => {
  const [data, setData] = useState([]);
  
  const [searchText, setSearchText] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('Tất cả');

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editForm] = Form.useForm();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]); 

  // 👉 BỔ SUNG: Trạng thái kiểm tra màn hình điện thoại
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUnits = () => {
    fetch('http://localhost:3000/units')
      .then(res => res.json())
      .then(result => {
        const reversedResult = [...result].reverse();
        const formattedData = reversedResult.map(item => ({ ...item, key: item.id }));
        setData(formattedData);
      })
      .catch(err => console.error("Lỗi tải đơn vị:", err));
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const filteredData = data.filter(item => {
    const lowerSearch = searchText.toLowerCase();
    const matchSearch = 
      item.tenDonVi?.toLowerCase().includes(lowerSearch) ||
      item.nguoiLienHe?.toLowerCase().includes(lowerSearch) ||
      item.soDienThoai?.includes(searchText);

    const matchTrangThai = filterTrangThai === 'Tất cả' || item.trangThai === filterTrangThai;

    return matchSearch && matchTrangThai;
  });

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
      message.error('Không kết nối được với Server!');
    }
  };

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

  const confirmDelete = (ids) => {
    setDeletingIds(ids);
    setIsDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    try {
      await Promise.all(deletingIds.map(id => 
        fetch(`http://localhost:3000/units/${id}`, { method: 'DELETE' })
      ));
      
      message.success(`Đã xóa thành công ${deletingIds.length} đơn vị!`);
      setIsDeleteModalVisible(false);
      setSelectedRowKeys([]); 
      fetchUnits();
    } catch (error) {
      message.error('Lỗi kết nối khi xóa!');
    }
  };

  const openEditModal = (record) => {
    setEditingUnit(record);
    editForm.setFieldsValue(record); 
    setIsEditModalVisible(true);
  };

  // 👉 ĐÃ SỬA: Hủy ghim checkbox trên mobile, bóp nhỏ cột
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    fixed: isMobile ? false : 'left', 
    columnWidth: 40,
  };

  // 👉 ĐÃ SỬA: Căn giữa, ghim cố định cột hành động bên phải
  const columns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (text, record, index) => index + 1 },
    { title: 'Tên đơn vị', dataIndex: 'tenDonVi', key: 'tenDonVi', width: 250, align: 'center' },
    { title: 'Người liên hệ', dataIndex: 'nguoiLienHe', key: 'nguoiLienHe', width: 200, align: 'center' },
    { title: 'Số điện thoại', dataIndex: 'soDienThoai', key: 'soDienThoai', width: 150, align: 'center' },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      width: 150,
      align: 'center',
      render: (trangThai) => (
        <Tag color={trangThai === 'Hoạt động' ? 'green' : 'red'}>
          {trangThai?.toUpperCase() || 'HOẠT ĐỘNG'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right', // Ghim cứng bên phải
      width: 80,      // Ép nhỏ cột lại
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Button 
            type="text" size="small"
icon={<EditOutlined style={{ color: '#1890ff', fontSize: '16px' }} />} 
            onClick={() => openEditModal(record)} 
          />
          <Button 
            type="text" size="small"
            icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />} 
            onClick={() => confirmDelete([record.id])} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 'clamp(10px, 2vw, 24px)', overflowX: 'hidden' }}>
      
      {/* 👉 ĐÃ SỬA: Header căn giữa, nút dồn lề phải */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        position: 'relative',     
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 28px)' }}>
            Quản lý Đơn vị phối hợp
          </Title>
        </div>
        
        <div style={{ 
          position: isMobile ? 'static' : 'absolute', 
          right: 0, 
          top: '50%', 
          transform: isMobile ? 'none' : 'translateY(-50%)',
          alignSelf: isMobile ? 'flex-end' : 'auto' 
        }}>
          <Space wrap style={{ justifyContent: 'flex-end' }}>
            {selectedRowKeys.length > 0 && (
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => confirmDelete(selectedRowKeys)} 
              >
                Xóa {selectedRowKeys.length} mục
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} style={{ backgroundColor: '#10b981', border: 'none' }}>
              Thêm đơn vị mới
            </Button>
          </Space>
        </div>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        {/* 👉 ĐÃ SỬA: Toolbar tự động bóp nhỏ trên mobile */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20, width: '100%' }}>
          <Space wrap style={{ width: '100%' }}>
            <Input 
              placeholder="Tìm tên, người liên hệ, SĐT..." 
              prefix={<SearchOutlined />} 
              style={{ width: '100%', minWidth: '200px', maxWidth: '300px' }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            
            <Select 
              value={filterTrangThai} 
              style={{ width: '100%', minWidth: '150px', maxWidth: '200px' }} 
              onChange={setFilterTrangThai}
            >
              <Select.Option value="Tất cả">Tất cả trạng thái</Select.Option>
<Select.Option value="Hoạt động">Hoạt động</Select.Option>
              <Select.Option value="Tạm ngưng">Tạm ngưng</Select.Option>
            </Select>

            {(searchText || filterTrangThai !== 'Tất cả') && (
              <Button type="link" onClick={() => { setSearchText(''); setFilterTrangThai('Tất cả'); }}>
                Bỏ lọc
              </Button>
            )}
          </Space>
        </div>

        {/* 👉 ĐÃ SỬA: Bổ sung cấu hình phân trang gọn nhẹ */}
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowSelection={rowSelection}
          scroll={{ x: 1000 }} 
          bordered 
          pagination={{ 
            pageSize: 8,
            showSizeChanger: false, 
            showLessItems: true,    
            simple: isMobile        
          }}
        />
      </Card>

      <Modal title="Thêm Đơn vị phối hợp mới" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} okText="Thêm mới" cancelText="Hủy" centered>
        <Form form={form} layout="vertical" onFinish={handleAddUnit}>
          <Form.Item name="tenDonVi" label="Tên đơn vị (Công an Phường/Quận)" rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị!' }]}><Input placeholder="Ví dụ: Công an Phường Phú Nhuận" /></Form.Item>
          <Form.Item name="nguoiLienHe" label="Người liên hệ (Chỉ huy)"><Input placeholder="Ví dụ: Đại úy Lê Văn A" /></Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại trực ban"><Input placeholder="Ví dụ: 0234.38... hoặc 090..." /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Cập nhật thông tin Đơn vị" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} onOk={() => editForm.submit()} okText="Lưu thay đổi" cancelText="Hủy" centered>
        <Form form={editForm} layout="vertical" onFinish={handleUpdateUnit}>
          <Form.Item name="tenDonVi" label="Tên đơn vị" rules={[{ required: true, message: 'Tên không được để trống' }]}><Input /></Form.Item>
          <Form.Item name="nguoiLienHe" label="Người liên hệ (Chỉ huy)"><Input /></Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại"><Input /></Form.Item>
          <Form.Item name="trangThai" label="Trạng thái hoạt động">
            <Select>
              <Select.Option value="Hoạt động">Hoạt động</Select.Option>
              <Select.Option value="Tạm ngưng">Tạm ngưng</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span><ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />Xác nhận xóa dữ liệu</span>}
        open={isDeleteModalVisible}
        onOk={executeDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
okText="Có, Xóa ngay"
        cancelText="Hủy bỏ"
        okButtonProps={{ danger: true }}
        centered
      >
        <p style={{ fontSize: '16px' }}>
          Bạn có chắc chắn muốn xóa <b>{deletingIds.length}</b> đơn vị này không? 
        </p>
        <p style={{ color: '#8c8c8c' }}>Hành động này không thể hoàn tác.</p>
      </Modal>

    </div>
  );
};

export default UnitManagement;