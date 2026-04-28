// src/pages/TuyenTruyen.jsx
import React from 'react';
import { Card, Button, Typography, List, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, FormOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TuyenTruyen = () => {
  const baiViet = [
    { id: 1, tieuDe: "Cảnh báo lừa đảo qua mạng hình thức 'Việc nhẹ lương cao'", ngayDang: "20/04/2026", luotXem: 1250 },
    { id: 2, tieuDe: "Quy định mới về xử phạt nồng độ cồn năm 2026", ngayDang: "18/04/2026", luotXem: 3400 },
    { id: 3, tieuDe: "Hành trang an toàn cho học sinh tới trường", ngayDang: "15/04/2026", luotXem: 890 }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý Bài viết Tuyên truyền</Title>
        <Button type="primary" icon={<FormOutlined />}>Soạn bài viết mới</Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <List
          itemLayout="horizontal"
          dataSource={baiViet}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="text" icon={<EditOutlined />}>Sửa</Button>,
                <Popconfirm title="Bạn có chắc muốn xóa bài này?" okText="Xóa" cancelText="Hủy">
                  <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                title={<a>{item.tieuDe}</a>}
                description={<Space><Text type="secondary">Ngày đăng: {item.ngayDang}</Text> <Text type="secondary"><EyeOutlined /> {item.luotXem} lượt xem</Text></Space>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default TuyenTruyen;