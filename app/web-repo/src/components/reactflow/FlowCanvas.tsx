import React, { useCallback, useMemo, useRef, forwardRef } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useOnSelectionChange,
  useReactFlow,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  BackgroundVariant,
} from "@xyflow/react";
import { Card } from "@arco-design/web-react";
import { useConfigStore } from "../../store";
import "./FlowCanvas.less";

export interface FlowCanvasProps {
  className?: string;
}

// 内部组件，用于访问 ReactFlow 的 context
const FlowCanvasInner = forwardRef<HTMLDivElement, FlowCanvasProps>(({ className }, ref) => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNodes,
    setSelectedEdges,
    clearSelection,
    canvasConfig,
  } = useConfigStore();

  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 使用 useOnSelectionChange hook 处理选择变化
  const onSelectionChange = useCallback(
    ({ nodes, edges }: any) => {
      setSelectedNodes(nodes.map((node: any) => node.id));
      setSelectedEdges(edges.map((edge: any) => edge.id));
    },
    [setSelectedNodes, setSelectedEdges],
  );

  useOnSelectionChange({
    onChange: onSelectionChange,
  });

  // 使用useMemo缓存节点和边的引用，避免不必要的重渲染
  const memoizedNodes = useMemo(() => nodes || [], [nodes]);
  const memoizedEdges = useMemo(() => edges || [], [edges]);

  // 优化onNodesChange，移除对nodes的依赖
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
    },
    [setNodes],
  );

  // 优化onEdgesChange，移除对edges的依赖
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((currentEdges) => applyEdgeChanges(changes, currentEdges));
    },
    [setEdges],
  );

  // 优化onConnect，移除对edges的依赖
  const onConnect: OnConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
      };
      setEdges((currentEdges) => addEdge(newEdge, currentEdges as any));
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("application/nodelabel");

      if (typeof type === "undefined" || !type) {
        return;
      }

      // 使用 screenToFlowPosition 来获取正确的流程坐标
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { label: label || `${type} node` },
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);
    },
    [setNodes, screenToFlowPosition],
  );

  // 点击空白区域清除选中
  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // 缓存ReactFlow的props
  const reactFlowProps = useMemo(
    () => ({
      fitView: canvasConfig?.fitViewOnInit ?? true,
      attributionPosition: "bottom-left" as const,
      nodesDraggable: true,
      nodesConnectable: true,
      elementsSelectable: true,
      selectNodesOnDrag: false,
      panOnDrag: true,
      zoomOnScroll: true,
      zoomOnPinch: true,
      panOnScroll: false,
      minZoom: 0.1,
      maxZoom: 2,
      style: { width: "100%", height: "100%" },
    }),
    [canvasConfig?.fitViewOnInit],
  );

  return (
    <div
      ref={ref || reactFlowWrapper}
      className="flow-wrapper"
      style={{ height: "800px", width: "100%" }}
    >
      <ReactFlow
        nodes={memoizedNodes}
        edges={memoizedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        {...reactFlowProps}
      >
        {canvasConfig?.showControls && <Controls />}
        {canvasConfig?.showMinimap && (
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.style?.borderColor) return n.style.borderColor as string;
              if (n.type === "input") return "#0041d0";
              if (n.type === "output") return "#ff0072";
              return "#1a192b";
            }}
            nodeColor={(n) => {
              if (n.style?.backgroundColor)
                return n.style.backgroundColor as string;
              return "#fff";
            }}
            nodeBorderRadius={2}
          />
        )}
        {canvasConfig?.showGrid && (
          <Background
            variant={"dots" as BackgroundVariant}
            gap={canvasConfig.gridSize || 20}
            size={1}
          />
        )}
      </ReactFlow>
    </div>
  );
});

// 主组件，提供 ReactFlow 的 Provider
export const FlowCanvas = forwardRef<HTMLDivElement, FlowCanvasProps>(({ className }, ref) => {
  return (
    <Card className={`flow-canvas ${className || ""}`}>
      <div className="flow-canvas-card">
        <FlowCanvasInner ref={ref} className={className} />
      </div>
    </Card>
  );
});
