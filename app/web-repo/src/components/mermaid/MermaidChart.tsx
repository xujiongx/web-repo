import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button, Card, Input, Space, Alert } from "@arco-design/web-react";

export interface MermaidChartProps {
  /** Mermaid图表定义 */
  chart: string;
  /** 图表主题，默认为 'default' */
  theme?: "default" | "dark" | "forest" | "neutral";
  /** 容器样式 */
  style?: React.CSSProperties;
  /** 容器类名 */
  className?: string;
  /** 是否显示编辑器 */
  editable?: boolean;
  /** 图表变化回调 */
  onChange?: (chart: string) => void;
}

const MermaidChart: React.FC<MermaidChartProps> = ({
  chart,
  theme = "default",
  style,
  className,
  editable = false,
  onChange,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [currentChart, setCurrentChart] = useState(chart);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(chart);

  // 初始化mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme,
      securityLevel: "loose",
      fontFamily: "monospace",
    });
  }, [theme]);

  // 渲染图表
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const renderChart = async () => {
      if (!chartRef.current || !currentChart.trim()) return;

      try {
        setError(null);
        // 清空容器
        chartRef.current.innerHTML = "";

        // 生成唯一ID
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // 渲染图表
        const { svg } = await mermaid.render(id, currentChart);
        chartRef.current.innerHTML = svg;
      } catch (err) {
        setError(err instanceof Error ? err.message : "图表渲染失败");
        console.error("Mermaid render error:", err);
      }
    };

    renderChart();
  }, [currentChart, theme]);

  const handleSave = () => {
    setCurrentChart(editValue);
    onChange?.(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(currentChart);
    setIsEditing(false);
  };

  return (
    <div className={className} style={style}>
      {editable && (
        <Card
          title="Mermaid 图表编辑器"
          extra={
            <Space>
              {!isEditing ? (
                <Button type="primary" onClick={() => setIsEditing(true)}>
                  编辑
                </Button>
              ) : (
                <>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button type="primary" onClick={handleSave}>
                    保存
                  </Button>
                </>
              )}
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          {isEditing ? (
            <Input.TextArea
              value={editValue}
              onChange={setEditValue}
              placeholder="请输入Mermaid图表定义..."
              autoSize={{ minRows: 6, maxRows: 20 }}
              style={{ fontFamily: "monospace" }}
            />
          ) : (
            <div
              style={{
                background: "#f7f8fa",
                padding: "12px",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "14px",
                whiteSpace: "pre-wrap",
              }}
            >
              {currentChart || "暂无图表定义"}
            </div>
          )}
        </Card>
      )}

      {error && <Alert type="error" style={{ marginBottom: 16 }} />}

      <div
        ref={chartRef}
        style={{
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
        }}
      >
        {!currentChart.trim() && !error && (
          <div style={{ color: "#999", fontSize: "14px" }}>暂无图表内容</div>
        )}
      </div>
    </div>
  );
};

export default MermaidChart;
