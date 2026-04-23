// src/pages/QuanLyDonVi.jsx
import React from 'react';
import { Table, Tag, Button, Card, Typography, Space } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const QuanLyDonVi = () => {
  const danhSachDonVi = [
    { id: "DV01", ten: "Công an Quận Phú Nhuận", lienHe: "Đại úy Lê C", sdt: "0901234567", trangThai: "Hoạt động" },
    { id: "DV02", ten: "Công an Quận 1", lienHe: "Thiếu tá Trần D", sdt: "0987654321", trangThai: "Hoạt động" },
    { id: "DV03", ten: "Đội CSGT Bến Thành", lienHe: "Trung úy Nguyễn E", sdt: "0911222333", trangThai: "Tạm ngưng" }
  ];

  const columns = [
    { title: 'Mã ĐV', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
    { title: 'Tên đơn vị', dataIndex: 'ten', key: 'ten' },
    { title: 'Người liên hệ', dataIndex: 'lienHe', key: 'lienHe' },
    { title: 'Số điện thoại', dataIndex: 'sdt', key: 'sdt' },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      dataIndex: 'trangThai',
      render: (trangThai) => (
        <Tag color={trangThai === 'Hoạt động' ? 'green' : 'red'}>
          {trangThai.toUpperCase()}
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
        <Button type="primary" icon={<PlusOutlined />}>Thêm đơn vị mới</Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <Table columns={columns} dataSource={danhSachDonVi} rowKey="id" bordered />
      </Card>
    </div>
  );
};

export default QuanLyDonVi;