import { PageHeader, Space, Card, Tabs } from "@arco-design/web-react";
import { createFileRoute } from "@tanstack/react-router";
import { MarkdownRenderer, MarkdownEditor } from "../../../components/markdown";

export const Route = createFileRoute("/_app/markdown/")({
  component: RouteComponent,
});

function RouteComponent() {
  const sampleMarkdown = `# Markdown渲染器演示

这是一个支持**Mermaid图表**的Markdown渲染器组件。

## 功能特性

- ✅ 标准Markdown语法支持
- ✅ Mermaid图表渲染
- ✅ 代码语法高亮
- ✅ 安全的HTML清理
- ✅ 响应式设计

## 流程图示例

\`\`\`mermaid
graph TD
    A[用户访问] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[跳转登录页]
    C --> E[加载用户数据]
    D --> F[用户登录]
    F --> C
    E --> G[渲染页面]
\`\`\`

## 序列图示例

\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库
    
    U->>F: 点击登录按钮
    F->>B: 发送登录请求
    B->>D: 验证用户信息
    D-->>B: 返回验证结果
    B-->>F: 返回登录状态
    F-->>U: 显示登录结果
\`\`\`

## 代码示例

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];
\`\`\`

## 表格示例

| 功能 | 状态 | 描述 |
|------|------|------|
| Markdown解析 | ✅ | 支持GFM语法 |
| Mermaid渲染 | ✅ | 支持多种图表类型 |
| 代码高亮 | ✅ | 基于highlight.js |
| 安全过滤 | ✅ | 防止XSS攻击 |

> **提示**: 这个组件可以安全地渲染用户输入的Markdown内容，同时支持丰富的Mermaid图表功能。`;

  return (
    <div>
      <PageHeader
        style={{ background: "var(--color-bg-2)" }}
        title="Markdown 渲染器"
        subTitle="支持Mermaid图表的Markdown渲染组件"
      />

      <div style={{ padding: "20px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Tabs defaultActiveTab="renderer">
            <Tabs.TabPane key="renderer" title="渲染器演示">
              <MarkdownRenderer content={sampleMarkdown} />
            </Tabs.TabPane>

            <Tabs.TabPane key="editor" title="编辑器演示">
              <MarkdownEditor
                initialValue={sampleMarkdown}
                height={700}
                showToolbar
              />
            </Tabs.TabPane>
          </Tabs>
        </Space>
      </div>
    </div>
  );
}
