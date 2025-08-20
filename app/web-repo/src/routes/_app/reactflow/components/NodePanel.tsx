import React, { DragEvent } from "react";
import { Card, Button } from "@arco-design/web-react";
import {
  IconSettings,
  IconStar,
  IconStop,
  IconApps,
  IconClose,
  IconDragArrow,
} from "@arco-design/web-react/icon";
import { useConfigStore } from "../store";
import { useDraggable } from "../../../../hooks/useDraggable";
import "./NodePanel.less";

export interface NodeType {
  type: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

const nodeTypes: NodeType[] = [
  {
    type: "input",
    label: "开始节点",
    color: "#52c41a",
    icon: <IconStar />,
    description: "流程的起始点",
  },
  {
    type: "default",
    label: "处理节点",
    color: "#1890ff",
    icon: <IconSettings />,
    description: "执行具体操作",
  },
  {
    type: "output",
    label: "结束节点",
    color: "#fa8c16",
    icon: <IconStop />,
    description: "流程的终点",
  },
];

interface NodePanelProps {
  className?: string;
}

export const NodePanel: React.FC<NodePanelProps> = ({ className }) => {
  const {
    nodePanelVisible,
    nodePanelPosition,
    toggleNodePanel,
    setNodePanelPosition,
  } = useConfigStore();

  // 为展开和收起状态分别创建 useDraggable
  const expandedDraggable = useDraggable({
    initialPosition: nodePanelPosition,
    onPositionChange: setNodePanelPosition,
    disabled: !nodePanelVisible,
  });

  const collapsedDraggable = useDraggable({
    initialPosition: nodePanelPosition,
    onPositionChange: setNodePanelPosition,
    disabled: nodePanelVisible,
  });

  const onDragStart = (event: DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/nodelabel", label);
    event.dataTransfer.effectAllowed = "move";
  };

  // 折叠状态下显示切换按钮
  if (!nodePanelVisible) {
    return (
      <div
        ref={collapsedDraggable.elementRef}
        className="node-panel-toggle"
        style={{
          left: nodePanelPosition.x,
          top: nodePanelPosition.y,
        }}
      >
        <Button
          type="primary"
          icon={<IconApps />}
          onClick={toggleNodePanel}
          size="large"
          onMouseDown={collapsedDraggable.handleMouseDown}
          style={{ cursor: "move" }}
        >
          节点库
          <IconDragArrow style={{ marginLeft: 8, fontSize: 12 }} />
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={expandedDraggable.elementRef}
      className={`node-panel ${className || ""}`}
      style={{
        left: nodePanelPosition.x,
        top: nodePanelPosition.y,
      }}
    >
      <Card
        title={
          <div
            className="draggable-header"
            onMouseDown={expandedDraggable.handleMouseDown}
          >
            <IconDragArrow className="drag-icon" />
            <span>节点库</span>
          </div>
        }
        size="small"
        className="node-panel-card"
        extra={
          <Button
            type="text"
            icon={<IconClose />}
            onClick={toggleNodePanel}
            size="small"
          />
        }
        headerStyle={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-border-2)",
          cursor: "move",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <div className="node-list">
          {nodeTypes.map((node) => (
            <div
              key={node.type}
              className="draggable-node"
              draggable
              onDragStart={(event) => onDragStart(event, node.type, node.label)}
              style={
                {
                  "--node-color": node.color,
                } as React.CSSProperties
              }
            >
              <div className="node-icon">{node.icon}</div>
              <div className="node-content">
                <div className="node-title">{node.label}</div>
                <div className="node-description">{node.description}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
