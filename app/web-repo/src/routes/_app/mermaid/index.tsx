import { PageHeader, Radio, Space, Card } from "@arco-design/web-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MermaidChart } from "../../../components/mermaid";

export const Route = createFileRoute("/_app/mermaid/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [theme, setTheme] = useState<"default" | "dark" | "forest" | "neutral">(
    "default",
  );
  const [chart, setChart] = useState(`graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[跳转登录页]
    C --> E[结束]
    D --> E`);

  const examples = [
    {
      title: "流程图",
      chart: `graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主页]
    B -->|否| D[跳转登录页]
    C --> E[结束]
    D --> E`,
    },
    {
      title: "序列图",
      chart: `sequenceDiagram
    participant A as 用户
    participant B as 前端
    participant C as 后端
    A->>B: 点击登录
    B->>C: 发送登录请求
    C-->>B: 返回token
    B-->>A: 登录成功`,
    },
    {
      title: "甘特图",
      chart: `gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析      :done, des1, 2024-01-01, 2024-01-05
    UI设计        :done, des2, after des1, 5d
    section 开发阶段
    前端开发      :active, dev1, 2024-01-10, 10d
    后端开发      :dev2, after dev1, 8d`,
    },
  ];

  return (
    <div>
      <PageHeader
        style={{ background: "var(--color-bg-2)" }}
        title="Mermaid 图表"
        subTitle="可视化图表组件演示"
      />

      <div style={{ padding: "20px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* 主题选择 */}
          <Card title="主题设置">
            <Radio.Group
              value={theme}
              onChange={setTheme}
              options={[
                { label: "默认", value: "default" },
                { label: "暗色", value: "dark" },
                { label: "森林", value: "forest" },
                { label: "中性", value: "neutral" },
              ]}
            />
          </Card>

          {/* 可编辑图表 */}
          <MermaidChart
            chart={chart}
            theme={theme}
            editable
            onChange={setChart}
          />

          {/* 示例图表 */}
          <div>
            <h3 style={{ marginBottom: "16px" }}>
              示例图表(
              <a
                href="https://www.mermaidchart.com/app/projects/8df17bc1-d52f-4461-997c-61ffd569e29d"
                target="_blank"
                rel="noopener noreferrer"
              >
                查看更多示例
              </a>
              )
            </h3>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {examples.map((example) => (
                <Card key={example.title} title={example.title}>
                  <MermaidChart chart={example.chart} theme={theme} />
                </Card>
              ))}
            </Space>
          </div>
        </Space>
      </div>
    </div>
  );
}
