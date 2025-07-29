import React, { useState } from 'react';
import { Card, Input, Space, Button, Select, Tooltip } from '@arco-design/web-react';
import { IconCopy, IconDownload } from '@arco-design/web-react/icon';
import MarkdownRenderer from './MarkdownRenderer';

export interface MarkdownEditorProps {
  /** 初始内容 */
  initialValue?: string;
  /** 编辑器高度，默认为 '100%' 自适应 */
  height?: number | string;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 内容变化回调 */
  onChange?: (content: string) => void;
  /** 保存回调 */
  onSave?: (content: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '',
  height = '100%', // 默认自适应高度
  showToolbar = true,
  onChange,
  onSave
}) => {
  const [content, setContent] = useState(initialValue);
  const [mermaidTheme, setMermaidTheme] = useState<'default' | 'dark' | 'forest' | 'neutral'>('default');

  const handleContentChange = (value: string) => {
    setContent(value);
    onChange?.(value);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // 这里可以添加成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const insertTemplate = (template: string) => {
    const templates = {
      mermaid_flowchart: `\n\`\`\`mermaid\ngraph TD\n    A[开始] --> B{条件判断}\n    B -->|是| C[执行操作A]\n    B -->|否| D[执行操作B]\n    C --> E[结束]\n    D --> E\n\`\`\`\n`,
      mermaid_sequence: `\n\`\`\`mermaid\nsequenceDiagram\n    participant A as 客户端\n    participant B as 服务器\n    A->>B: 发送请求\n    B-->>A: 返回响应\n\`\`\`\n`,
      table: `\n| 列1 | 列2 | 列3 |\n|------|------|------|\n| 数据1 | 数据2 | 数据3 |\n| 数据4 | 数据5 | 数据6 |\n`,
      code: `\n\`\`\`javascript\nfunction hello() {\n    console.log('Hello, World!');\n}\n\`\`\`\n`
    };
    
    const templateContent = templates[template as keyof typeof templates];
    if (templateContent) {
      setContent(prev => prev + templateContent);
    }
  };

  const toolbar = showToolbar && (
    <div style={{ 
      padding: '12px 16px', 
      borderBottom: '1px solid var(--color-border-2)',
      background: 'var(--color-bg-1)',
      flexShrink: 0, // 防止工具栏被压缩
      display: 'flex',
      alignItems: 'center'
    }}>
      <Space>
        <Select
          placeholder="插入模板"
          style={{ width: 140 }}
          onChange={insertTemplate}
          options={[
            { label: 'Mermaid流程图', value: 'mermaid_flowchart' },
            { label: 'Mermaid序列图', value: 'mermaid_sequence' },
            { label: '表格', value: 'table' },
            { label: '代码块', value: 'code' }
          ]}
        />
        
        <Select
          placeholder="Mermaid主题"
          value={mermaidTheme}
          onChange={setMermaidTheme}
          style={{ width: 120 }}
          options={[
            { label: '默认', value: 'default' },
            { label: '暗色', value: 'dark' },
            { label: '森林', value: 'forest' },
            { label: '中性', value: 'neutral' }
          ]}
        />
        
        <Tooltip content="复制内容">
          <Button icon={<IconCopy />} onClick={copyToClipboard} />
        </Tooltip>
        
        <Tooltip content="下载Markdown">
          <Button icon={<IconDownload />} onClick={downloadMarkdown} />
        </Tooltip>
        
        {onSave && (
          <Button type="primary" onClick={() => onSave(content)}>
            保存
          </Button>
        )}
      </Space>
    </div>
  );

  return (
    <Card 
      style={{ 
        height,
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{ 
        padding: 0, 
        flex: 1,
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0 // 允许内容区域缩小
      }}
    >
      {toolbar}
      
      {/* 左右布局容器 */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        minHeight: 0 // 关键：允许容器缩小以适应父容器
      }}>
        {/* 左侧编辑区 */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: '1px solid var(--color-border-2)',
          minHeight: 0
        }}>
          <div style={{
            padding: '8px 16px',
            background: 'var(--color-bg-2)',
            borderBottom: '1px solid var(--color-border-2)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-2)',
            flexShrink: 0
          }}>
            编辑
          </div>
          <Input.TextArea
            value={content}
            onChange={handleContentChange}
            placeholder="请输入Markdown内容...支持Mermaid图表"
            style={{
              flex: 1,
              border: 'none',
              resize: 'none',
              fontFamily: 'Monaco, Menlo, \"Ubuntu Mono\", monospace',
              fontSize: '14px',
              lineHeight: '1.5',
              padding: '16px',
              outline: 'none',
              boxShadow: 'none',
              borderRadius: 0,
              minHeight: 0 // 允许文本区域缩小
            }}
            autoSize={false}
          />
        </div>
        
        {/* 右侧预览区 */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: 0
        }}>
          <div style={{
            padding: '8px 16px',
            background: 'var(--color-bg-2)',
            borderBottom: '1px solid var(--color-border-2)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-2)',
            flexShrink: 0
          }}>
            预览
          </div>
          <div style={{ 
            flex: 1,
            overflow: 'auto', 
            padding: '16px',
            background: 'var(--color-bg-1)',
            minHeight: 0 // 允许预览区域缩小
          }}>
            <MarkdownRenderer 
              content={content}
              bordered={false}
              mermaidTheme={mermaidTheme}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarkdownEditor;