// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
// Import thư viện biểu đồ Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: {}, chartData: [] });

  useEffect(() => {
    fetch('http://localhost:3000/reports/stats')
      .then(res => res.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => console.error("Lỗi lấy thống kê:", err));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Tổng quan hệ thống</Title>

      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Tổng phản ánh" value={data.stats.total} valueStyle={{ color: '#1f2937' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Mới tiếp nhận" value={data.stats.news} valueStyle={{ color: '#3b82f6' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Đang xử lý" value={data.stats.pending} valueStyle={{ color: '#f59e0b' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card">
            <Statistic title="Đã hoàn thành" value={data.stats.processed} valueStyle={{ color: '#10b981' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="Phân tích tiến độ theo Mảng vi phạm" bordered={false}>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mang" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tongSo" name="Tổng số" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="daXuLy" name="Đã xử lý" radius={[4, 4, 0, 0]}>
                    {data.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.mauSac} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;