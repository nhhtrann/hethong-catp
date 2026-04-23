// src/pages/BaoCaoThongKe.jsx
import React from 'react';
import { Card, Row, Col, Typography, Select, Button, Space } from 'antd';
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const BaoCaoThongKe = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Báo cáo & Thống kê</Title>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="Xuất Báo cáo Hiệu suất" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%' }}>
            <p><Text type="secondary">Báo cáo bao gồm danh sách các đơn vị phối hợp, số lượng vụ việc đã xử lý, đang xử lý và tỷ lệ hoàn thành trong tháng.</Text></p>
            
            <Space style={{ marginTop: '20px' }}>
              <Select defaultValue="04-2026" style={{ width: 150 }}>
                <Option value="04-2026">Tháng 4 / 2026</Option>
                <Option value="03-2026">Tháng 3 / 2026</Option>
              </Select>
              <Button type="primary" style={{ backgroundColor: '#10b981' }} icon={<FileExcelOutlined />}>
                Tải xuống Excel
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Báo cáo Tuyên truyền" bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '100%' }}>
            <p><Text type="secondary">Thống kê số lượng bài viết tuyên truyền pháp luật và lượt tiếp cận của người dân theo từng chuyên mục.</Text></p>
            
            <Button type="primary" style={{ marginTop: '20px', backgroundColor: '#ef4444' }} icon={<FilePdfOutlined />}>
              Xuất file PDF
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BaoCaoThongKe;