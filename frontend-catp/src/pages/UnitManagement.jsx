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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [phuongXaList, setPhuongXaList] = useState([]);
  const fetchPhuongXa = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/units/phuong-xa/list`);
    const data = await res.json();
    setPhuongXaList(data);
  } catch (error) {
    console.error("Lỗi lấy danh sách Phường Xã:", error);
  }
};

  useEffect(() => {
    fetchPhuongXa();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUnits = () => {
    fetch(`${import.meta.env.VITE_API_URL}/units`)
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
    // Thêm .trim() để cắt gọt khoảng trắng thừa ở 2 đầu trước khi gửi lên Server
    const cleanData = {
      tenDonVi: values.tenDonVi.trim(),
      nguoiLienHe: values.nguoiLienHe.trim(),
      soDienThoai: values.soDienThoai.trim(),
      trangThai: 'Hoạt động'
    };

    message.loading({ content: 'Đang lưu dữ liệu...', key: 'addUnit' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      });

      if (response.ok) {
        message.success({ content: 'Đã thêm đơn vị mới thành công!', key: 'addUnit', duration: 3 });
        setIsModalVisible(false);
        form.resetFields(); 
        fetchUnits(); 
      } else {
        // 👉 BẮT LỖI SERVER Ở ĐÂY
        if (response.status === 500) {
          message.error({ content: 'Máy chủ đang gặp sự cố (Lỗi 500). Vui lòng thử lại sau!', key: 'addUnit', duration: 4 });
        } else if (response.status === 404) {
          message.error({ content: 'Không tìm thấy đường dẫn hệ thống (Lỗi 404).', key: 'addUnit', duration: 4 });
        } else {
          // Bắt các lỗi do mình tự cấu hình từ Backend (như trùng tên, thiếu dữ liệu)
          const errorData = await response.json();
          message.error({ content: errorData.message || 'Lý do từ chối: Dữ liệu không hợp lệ!', key: 'addUnit', duration: 4 });
        }
      }
    } catch (error) {
      // Lỗi rơi vào catch thường là do sập mạng hoặc Backend chưa chạy
      message.error({ content: 'Mất kết nối mạng! Vui lòng kiểm tra lại đường truyền.', key: 'addUnit', duration: 4 });
    }
  };

  const handleUpdateUnit = async (values) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/units/${editingUnit.id}`, {
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
        fetch(`${import.meta.env.VITE_API_URL}/units/${id}`, { method: 'DELETE' })
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    fixed: isMobile ? false : 'left', 
    columnWidth: 40,
  };

  const columns = [
    { title: 'STT', key: 'stt', width: 60, align: 'center', render: (text, record, index) => (currentPage - 1) * 8 + index + 1 
    },
    { title: 'Tên đơn vị', dataIndex: 'tenDonVi', key: 'tenDonVi', width: 250, align: 'center' },
    {
    title: 'Phường/Xã',
    dataIndex: 'phuongXa', // Nhận về object phuongXa từ Backend
    key: 'phuongXa',
    render: (phuongXa) => phuongXa ? <b>{phuongXa.tenPhuongXa}</b> : <i style={{ color: '#ccc' }}>Chưa cập nhật</i>
    },
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
      fixed: 'right', 
      width: 80,      
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

  // 👉 HÀM XỬ LÝ CHỌN TẤT CẢ CÁC TRANG
  const handleSelectAllAcrossPages = () => {
    // Lấy toàn bộ ID của danh sách đang được lọc và đẩy vào selectedRowKeys
    const allKeys = filteredData.map(item => item.key);
    setSelectedRowKeys(allKeys);
  };

  return (
    <div style={{ padding: 'clamp(10px, 2vw, 24px)', maxWidth: '1400px', margin: '0 auto', overflowX: 'hidden' }}>
      
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

        {/* 👉 BỔ SUNG: THANH BÁO CHỌN TẤT CẢ (Giống y hệt ảnh số 3 và 2 của bạn) */}
        {selectedRowKeys.length > 0 && (
          <div style={{ 
            backgroundColor: '#e6f4ff', 
            border: '1px solid #91caff', 
            borderRadius: '6px', 
            padding: '8px 16px', 
            marginBottom: '16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Tag 
                closable 
                onClose={() => setSelectedRowKeys([])} // Nút X để bỏ chọn tất cả
                color="blue" 
                style={{ fontSize: '14px', padding: '2px 8px', margin: 0 }}
              >
                Đã chọn {selectedRowKeys.length}
              </Tag>
              <span style={{ marginLeft: '12px', color: '#595959', fontSize: '14px' }}>
                {selectedRowKeys.length === filteredData.length 
                  ? 'Bạn đã chọn toàn bộ dữ liệu.' 
                  : `Bạn đang chọn ${selectedRowKeys.length} đơn vị.`}
              </span>
            </div>
            
            {/* Hiện link "Chọn tất cả" nếu người dùng chưa chọn hết danh sách */}
            {selectedRowKeys.length < filteredData.length && (
              <Button 
                type="link" 
                onClick={handleSelectAllAcrossPages} 
                style={{ padding: 0, fontWeight: '500', fontSize: '14px' }}
              >
                Chọn tất cả {filteredData.length} đơn vị trong danh sách này
              </Button>
            )}
          </div>
        )}

        <Table 
          size="middle"
          columns={columns} 
          dataSource={filteredData} 
          rowSelection={rowSelection}
          scroll={{ x: 'max-content' }} 
          bordered 
          pagination={{ 
            pageSize: 8,
            showSizeChanger: false, 
            showLessItems: true,    
            simple: isMobile,
            current: currentPage,
            onChange: (page) => setCurrentPage(page)
          }}
        />
      </Card>

      <Modal title="Thêm Đơn vị phối hợp mới" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} okText="Thêm mới" cancelText="Hủy" centered>
        <Form form={form} layout="vertical" onFinish={handleAddUnit}>
          <Form.Item 
          name="tenDonVi" 
          label="Tên đơn vị (Công an Phường/Quận)" 
          rules={[
            { required: true, message: 'Vui lòng nhập tên đơn vị!' },
            { whitespace: true, message: 'Tên đơn vị không được chỉ chứa khoảng trắng!' },
            { max: 100, message: 'Tên quá dài, tối đa 100 ký tự!' }
          ]}
        >
          <Input placeholder="Ví dụ: Công an Phường Phú Nhuận" />
        </Form.Item>

        <Form.Item 
          label="Thuộc Phường/Xã" 
          name="phuongXaId"  // 👉 Đổi name thành phuongXaId (khớp với khóa ngoại)
          rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
        >
          <Select placeholder="-- Chọn Phường/Xã tại Huế --" showSearch>
            {phuongXaList.map(px => (
      // Dùng ID làm value, tenPhuongXa làm chữ hiển thị
            <Select.Option key={px.id} value={px.id}>{px.tenPhuongXa}</Select.Option>
        ))}
          </Select>
        </Form.Item>

        <Form.Item 
          name="nguoiLienHe" 
          label="Người liên hệ (Chỉ huy)"
          rules={[
            { required: true, message: 'Vui lòng nhập tên người liên hệ!' },
            { whitespace: true, message: 'Tên không được chỉ chứa khoảng trắng!' }
          ]}
        >
          <Input placeholder="Ví dụ: Đại úy Lê Văn A" />
        </Form.Item>

        <Form.Item 
          name="soDienThoai" 
          label="Số điện thoại trực ban"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { whitespace: true, message: 'Số điện thoại không được để trống!' },
            // Chỉ cho phép nhập số, dấu chấm, khoảng trắng hoặc dấu gạch ngang
            { pattern: /^[0-9\.\-\s]+$/, message: 'Số điện thoại chỉ được chứa chữ số và ký tự hợp lệ!' },
            { min: 8, message: 'Số điện thoại quá ngắn!' }
          ]}
        >
          <Input placeholder="Ví dụ: 0234.38... hoặc 090..." />
        </Form.Item>
        </Form>
      </Modal>

      <Modal title="Cập nhật thông tin Đơn vị" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} onOk={() => editForm.submit()} okText="Lưu thay đổi" cancelText="Hủy" centered>
        <Form form={editForm} layout="vertical" onFinish={handleUpdateUnit}>
          <Form.Item name="tenDonVi" label="Tên đơn vị" rules={[{ required: true, message: 'Tên không được để trống' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nguoiLienHe" label="Người liên hệ (Chỉ huy)" rules={[{ required: true, message: 'Vui lòng nhập tên người liên hệ!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="soDienThoai" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
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