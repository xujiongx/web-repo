import React from 'react';
import { PageHeader, Button, Space, Message } from '@arco-design/web-react';
import { IconRefresh, IconDownload, IconSave } from '@arco-design/web-react/icon';
import { createFileRoute } from '@tanstack/react-router';
import { ReactFlowProvider } from '@xyflow/react';
import { NodePanel } from '../../../components/reactflow/NodePanel';
import { FlowCanvas } from '../../../components/reactflow/FlowCanvas';
import { ConfigPanel } from '../../../components/reactflow/ConfigPanel';
import { useConfigStore } from '../../../store';
import '@xyflow/react/dist/style.css';
import './index.less';

export const Route = createFileRoute('/_app/reactflow/')({ 
  component: RouteComponent,
});

function RouteComponent() {
  const {
    nodes,
    edges,
    resetData,
  } = useConfigStore();

  const handleReset = () => {
    resetData();
    Message.success('已重置流程图数据');
  };

  const handleSave = () => {
    // 这里可以添加保存逻辑
    console.log('保存数据:', { nodes, edges });
    Message.success('保存成功');
  };

  const handleExport = () => {
    // 这里可以添加导出逻辑
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reactflow-data.json';
    a.click();
    URL.revokeObjectURL(url);
    Message.success('导出成功');
  };

  return (
    <div className="reactflow-page">
      <PageHeader
        title="React Flow 流程图"
        subTitle="拖拽节点创建流程图"
        extra={
          <Space>
            <Button
              type="outline"
              icon={<IconRefresh />}
              onClick={handleReset}
            >
              重置
            </Button>
            <Button
              type="primary"
              icon={<IconSave />}
              onClick={handleSave}
            >
              保存
            </Button>
            <Button
              type="primary"
              icon={<IconDownload />}
              onClick={handleExport}
            >
              导出
            </Button>
          </Space>
        }
      />
      <div className="reactflow-container">
        <ReactFlowProvider>
          <NodePanel />
          <FlowCanvas />
          <ConfigPanel />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
