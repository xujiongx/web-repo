import React, { useMemo, useCallback } from 'react';
import {
  Card,
  Tabs,
  Form,
  Switch,
  Slider,
  Button,
  Space,
  Input,
  Select,
  ColorPicker,
  InputNumber,
  Typography,
  Divider,
} from '@arco-design/web-react';
import {
  IconSettings,
  IconClose,
  IconRefresh,
  IconDragArrow,
  IconApps,        // 替代 IconNode
  IconLink,        // 替代 IconConnection
} from '@arco-design/web-react/icon';
import { useConfigStore } from '../../store';
import { useDraggable } from '../../hooks/useDraggable';
import './ConfigPanel.less';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { Title, Text } = Typography;
const { Option } = Select;

// 节点属性编辑组件
const NodePropertiesEditor: React.FC<{
  selectedNode: any;
  onLabelChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}> = ({ selectedNode, onLabelChange, onTypeChange }) => (
  <div className="property-section">
    <div className="section-header">
      <IconApps className="section-icon" />
      <Title heading={6} className="section-title">
        节点属性
      </Title>
    </div>

    <div className="form-grid">
      <FormItem label="节点文本" className="form-item-enhanced">
        <Input
          value={selectedNode.data?.label || ""}
          onChange={onLabelChange}
          placeholder="请输入节点文本"
          className="input-enhanced"
        />
      </FormItem>

      <FormItem label="节点类型" className="form-item-enhanced">
        <Select
          value={selectedNode.type || "default"}
          onChange={onTypeChange}
          className="select-enhanced"
        >
          <Option value="default">默认节点</Option>
          <Option value="input">开始节点</Option>
          <Option value="output">结束节点</Option>
        </Select>
      </FormItem>
    </div>
  </div>
);

// 连线属性编辑组件
const EdgePropertiesEditor: React.FC<{
  selectedEdge: any;
  onStyleChange: (styleKey: string, value: any) => void;
}> = ({ selectedEdge, onStyleChange }) => (
  <div className="property-section">
    <div className="section-header">
      <IconLink className="section-icon" />
      <Title heading={6} className="section-title">
        连线属性
      </Title>
    </div>

    <div className="form-grid">
      <FormItem label="线条样式" className="form-item-enhanced">
        <Select
          value={selectedEdge.style?.strokeDasharray ? "dashed" : "solid"}
          onChange={(value) =>
            onStyleChange(
              "strokeDasharray",
              value === "solid" ? undefined : "5,5",
            )
          }
          className="select-enhanced"
        >
          <Option value="solid">实线</Option>
          <Option value="dashed">虚线</Option>
        </Select>
      </FormItem>

      <FormItem label="线条颜色" className="form-item-enhanced">
        <ColorPicker
          value={selectedEdge.style?.stroke || "#b1b1b7"}
          onChange={(value) => onStyleChange("stroke", value)}
          className="color-picker-enhanced"
        />
      </FormItem>

      <FormItem label="线条粗细" className="form-item-enhanced">
        <InputNumber
          value={selectedEdge.style?.strokeWidth || 1}
          onChange={(value) => onStyleChange("strokeWidth", value)}
          min={1}
          max={10}
          className="input-number-enhanced"
        />
      </FormItem>
    </div>
  </div>
);

// 画布设置组件
const CanvasSettings: React.FC<{
  canvasConfig: any;
  onConfigChange: (config: any) => void;
}> = ({ canvasConfig, onConfigChange }) => (
  <div className="settings-container">
    <div className="settings-grid">
      <div className="setting-item">
        <div className="setting-label">
          <Text className="label-text">显示网格</Text>
          <Text className="label-desc">在画布上显示网格线</Text>
        </div>
        <Switch
          checked={canvasConfig.showGrid}
          onChange={(checked) => onConfigChange({ showGrid: checked })}
          className="switch-enhanced"
        />
      </div>
      
      <div className="setting-item">
        <div className="setting-label">
          <Text className="label-text">网格大小</Text>
          <Text className="label-desc">调整网格的间距大小</Text>
        </div>
        <div className="slider-container">
          <Slider
            value={canvasConfig.gridSize}
            onChange={(value) => onConfigChange({ gridSize: value })}
            min={10}
            max={50}
            step={5}
            className="slider-enhanced"
          />
          <Text className="slider-value">{canvasConfig.gridSize}px</Text>
        </div>
      </div>
      
      <Divider className="settings-divider" />
      
      <div className="setting-item">
        <div className="setting-label">
          <Text className="label-text">显示缩略图</Text>
          <Text className="label-desc">在右下角显示画布缩略图</Text>
        </div>
        <Switch
          checked={canvasConfig.showMinimap}
          onChange={(checked) => onConfigChange({ showMinimap: checked })}
          className="switch-enhanced"
        />
      </div>
      
      <div className="setting-item">
        <div className="setting-label">
          <Text className="label-text">显示控制面板</Text>
          <Text className="label-desc">显示缩放和适应视图控件</Text>
        </div>
        <Switch
          checked={canvasConfig.showControls}
          onChange={(checked) => onConfigChange({ showControls: checked })}
          className="switch-enhanced"
        />
      </div>
      
      <div className="setting-item">
        <div className="setting-label">
          <Text className="label-text">自动适应视图</Text>
          <Text className="label-desc">初始化时自动调整视图大小</Text>
        </div>
        <Switch
          checked={canvasConfig.fitViewOnInit}
          onChange={(checked) => onConfigChange({ fitViewOnInit: checked })}
          className="switch-enhanced"
        />
      </div>
    </div>
  </div>
);

export const ConfigPanel: React.FC = () => {
  const {
    isVisible,
    activeTab,
    canvasConfig,
    selectedNodes,
    selectedEdges,
    nodes,
    edges,
    configPanelPosition,
    togglePanel,
    setActiveTab,
    updateCanvasConfig,
    updateNodeLabel,
    updateNodeType,
    updateEdgeStyle,
    resetConfig,
    setConfigPanelPosition,
  } = useConfigStore();

  // 为展开和收起状态分别创建 useDraggable
  const expandedDraggable = useDraggable({
    initialPosition: configPanelPosition,
    onPositionChange: setConfigPanelPosition,
    disabled: !isVisible,
  });
  
  const collapsedDraggable = useDraggable({
    initialPosition: configPanelPosition,
    onPositionChange: setConfigPanelPosition,
    disabled: isVisible,
  });

  // 使用useMemo优化选中节点和连线的获取
  const selectedNode = useMemo(() => {
    if (selectedNodes.length === 1) {
      return nodes.find(n => n.id === selectedNodes[0]) || null;
    }
    return null;
  }, [selectedNodes, nodes]);
  
  const selectedEdge = useMemo(() => {
    if (selectedEdges.length === 1) {
      return edges.find(e => e.id === selectedEdges[0]) || null;
    }
    return null;
  }, [selectedEdges, edges]);
  
  const hasSelection = selectedNode || selectedEdge;

  // 处理节点标签更新
  const handleNodeLabelChange = useCallback((value: string) => {
    if (selectedNode) {
      updateNodeLabel(selectedNode.id, value);
    }
  }, [selectedNode, updateNodeLabel]);

  // 处理节点类型更新
  const handleNodeTypeChange = useCallback((value: string) => {
    if (selectedNode) {
      updateNodeType(selectedNode.id, value);
    }
  }, [selectedNode, updateNodeType]);

  // 处理连线样式更新
  const handleEdgeStyleChange = useCallback((styleKey: string, value: any) => {
    if (selectedEdge) {
      updateEdgeStyle(selectedEdge.id, { [styleKey]: value });
    }
  }, [selectedEdge, updateEdgeStyle]);

  if (!isVisible) {
    return (
      <div 
        ref={collapsedDraggable.elementRef}
        className="config-panel-toggle"
        style={{
          right: window.innerWidth - configPanelPosition.x - 340,
          top: configPanelPosition.y
        }}
      >
        <Button
          type="primary"
          icon={<IconSettings />}
          onClick={togglePanel}
          size="large"
          className="toggle-button"
          onMouseDown={collapsedDraggable.handleMouseDown}
          style={{ cursor: 'move' }}
        >
          配置面板
          <IconDragArrow style={{ marginLeft: 8, fontSize: 12 }} />
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={expandedDraggable.elementRef}
      className="config-panel"
      style={{
        left: configPanelPosition.x,
        top: configPanelPosition.y
      }}
    >
      <Card
        className="config-panel-card"
        title={
          <div className="panel-header">
            <div className="draggable-header" onMouseDown={expandedDraggable.handleMouseDown}>
              <IconDragArrow className="drag-icon" />
              <span className="panel-title">
                {hasSelection ? '属性编辑器' : '配置面板'}
              </span>
            </div>
          </div>
        }
        extra={
          <Space className="header-actions">
            <Button
              type="text"
              icon={<IconRefresh />}
              onClick={resetConfig}
              size="small"
              className="action-button"
              title="重置配置"
            />
            <Button
              type="text"
              icon={<IconClose />}
              onClick={togglePanel}
              size="small"
              className="action-button close-button"
              title="关闭面板"
            />
          </Space>
        }
      >
        <div className="panel-content">
          {hasSelection ? (
            <div className="property-editor">
              {selectedNode && (
                <NodePropertiesEditor
                  selectedNode={selectedNode}
                  onLabelChange={handleNodeLabelChange}
                  onTypeChange={handleNodeTypeChange}
                />
              )}
              
              {selectedEdge && (
                <EdgePropertiesEditor
                  selectedEdge={selectedEdge}
                  onStyleChange={handleEdgeStyleChange}
                />
              )}
            </div>
          ) : (
            <Tabs 
              activeTab={activeTab} 
              onChange={(key) => setActiveTab(key as "nodes" | "edges" | "settings")}
              className="config-tabs"
            >
              <TabPane key="settings" title="画布设置">
                <CanvasSettings
                  canvasConfig={canvasConfig}
                  onConfigChange={updateCanvasConfig}
                />
              </TabPane>
            </Tabs>
          )}
        </div>
      </Card>
    </div>
  );
};