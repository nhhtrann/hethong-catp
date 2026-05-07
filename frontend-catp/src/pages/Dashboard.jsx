
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography } from 'antd';
import { AlertOutlined, CheckCircleOutlined, SyncOutlined, FileTextOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const { Title } = Typography;

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
   
    fetch('http://localhost:3000/reports')
      .then(res => res.json())
      .then(result => Array.isArray(result) && setData(result))
      .catch(err => console.error(err));

   
    fetch('http://localhost:3000/news')
      .then(res => res.json())
      .then(result => Array.isArray(result) && setNews(result))
      .catch(err => console.error(err));
  }, []);

  // Tính toán số liệu
  const total = data.length;
  const moi = data.filter(d => d.trangThai === 'Mới').length;
  const dangXuLy = data.filter(d => d.trangThai === 'Đang xử lý').length;
  const hoanThanh = data.filter(d => d.trangThai === 'Hoàn thành').length;

  // Dữ liệu biểu đồ tròn
  const pieData = [
    { name: 'Mới', value: moi },
    { name: 'Đang xử lý', value: dangXuLy },
    { name: 'Hoàn thành', value: hoanThanh }
  ];
  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  // Cấu hình bảng 5 vụ việc mới nhất
  const columns = [
    { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe' },
    { title: 'Đơn vị xử lý', dataIndex: 'donViXuLy', key: 'donViXuLy', render: (val) => val || 'Chưa phân công' },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai',
      render: (trangThai) => {
        let color = trangThai === 'Mới' ? 'volcano' : (trangThai === 'Đang xử lý' ? 'gold' : 'green');
        return <Tag color={color}>{trangThai?.toUpperCase()}</Tag>;
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Tổng quan Hệ thống</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Statistic title="Tổng số vụ việc" value={total} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Statistic title="Phản ánh Mới (Cần xử lý)" value={moi} valueStyle={{ color: '#ef4444' }} prefix={<AlertOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Statistic title="Đang xử lý" value={dangXuLy} valueStyle={{ color: '#f59e0b' }} prefix={<SyncOutlined spin />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <Statistic title="Đã hoàn thành" value={hoanThanh} valueStyle={{ color: '#10b981' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {}
      <Row gutter={[24, 24]}>
        {}
        <Col xs={24} lg={14}>
          <Card title="Các vụ việc mới nhất (Top 5)" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%' }}>
            <Table 
              columns={columns} 
              dataSource={[...data].reverse().slice(0, 5)} 
              
            
              scroll={{ x: 'max-content' }} 
              
              pagination={false} 
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
        
        {}
        <Col xs={24} lg={10}>
          <Card title="Tỷ lệ Trạng thái" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%' }}>
            <div style={{ height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;