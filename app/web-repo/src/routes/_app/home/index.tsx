import { getUsers } from '@/services'
import { PageHeader, Radio, Table, Card, Spin, Alert } from '@arco-design/web-react';
import { createFileRoute } from '@tanstack/react-router';
import { useRequest } from 'ahooks';

export const Route = createFileRoute('/_app/home/')({  
  component: RouteComponent,
});

function RouteComponent() {
  // 使用 useRequest 调用 getUsers 接口
  const { data: users, loading, error, refresh } = useRequest(getUsers, {
    // 缓存key
    cacheKey: 'users-list',
  });

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  return (
    <div>
      <PageHeader
        style={{ background: "var(--color-bg-2)" }}
        title="首页"
        subTitle="用户管理系统"
        extra={
          <div>
            <Radio.Group mode="fill" type="button" defaultValue="small">
              <Radio value="large">Large</Radio>
              <Radio value="medium">Medium</Radio>
              <Radio value="small">Small</Radio>
            </Radio.Group>
          </div>
        }
      />
      
      <div style={{ padding: '20px' }}>
        <Card 
          title="用户列表" 
          extra={
            <button 
              onClick={refresh}
              style={{ 
                padding: '4px 12px', 
                border: '1px solid #d9d9d9', 
                borderRadius: '4px',
                background: '#fff',
                cursor: 'pointer'
              }}
              type="button"
            >
              刷新
            </button>
          }
        >
          {error && (
            <Alert
              type="error"
              style={{ marginBottom: 16 }}
              showIcon
            />
          )}
          
          <Spin loading={loading}>
            <Table
              columns={columns}
              data={users || []}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: true,
                showJumper: true,
              }}
              border
              stripe
            />
          </Spin>
        </Card>
      </div>
    </div>
  );
}
