import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Node, Edge } from '@xyflow/react';

// 配置面板状态接口
export interface ConfigPanelState {
  // 面板显示状态
  isVisible: boolean;
  nodePanelVisible: boolean;
  activeTab: 'nodes' | 'edges' | 'settings';
  
  // 面板位置状态
  nodePanelPosition: { x: number; y: number };
  configPanelPosition: { x: number; y: number };
  
  // 节点和连线数据
  nodes: Node[];
  edges: Edge[];
  
  // 选中状态
  selectedNodes: string[];
  selectedEdges: string[];
  
  // 画布配置
  canvasConfig: {
    showGrid: boolean;
    gridSize: number;
    showMinimap: boolean;
    showControls: boolean;
    fitViewOnInit: boolean;
  };
}

// 配置面板操作接口
export interface ConfigPanelActions {
  // 面板操作
  togglePanel: () => void;
  toggleNodePanel: () => void;
  setActiveTab: (tab: ConfigPanelState['activeTab']) => void;
  
  // 面板位置操作
  setNodePanelPosition: (position: { x: number; y: number }) => void;
  setConfigPanelPosition: (position: { x: number; y: number }) => void;
  
  // 节点和连线数据操作
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  updateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  
  // 选中状态操作
  setSelectedNodes: (nodeIds: string[]) => void;
  setSelectedEdges: (edgeIds: string[]) => void;
  selectNode: (nodeId: string) => void;
  selectEdge: (edgeId: string) => void;
  unselectNode: (nodeId: string) => void;
  unselectEdge: (edgeId: string) => void;
  clearSelection: () => void;
  
  // 编辑操作
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeType: (nodeId: string, type: string) => void;
  updateEdgeStyle: (edgeId: string, style: Partial<{ strokeDasharray: string; stroke: string; strokeWidth: number; }>) => void;
  
  // 画布配置操作
  updateCanvasConfig: (config: Partial<ConfigPanelState['canvasConfig']>) => void;
  
  // 重置配置
  resetConfig: () => void;
  resetData: () => void;
}

// 初始节点数据
const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: '开始节点' },
    type: 'input',
  },
  {
    id: '2',
    position: { x: 100, y: 200 },
    data: { label: '处理节点' },
  },
  {
    id: '3',
    position: { x: 100, y: 300 },
    data: { label: '结束节点' },
    type: 'output',
  },
];

// 初始边数据
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

// 默认配置
const defaultConfig: ConfigPanelState = {
  isVisible: true,
  nodePanelVisible: true,
  activeTab: 'nodes',
  
  // 默认面板位置
  nodePanelPosition: { x: 20, y: 20 },
  configPanelPosition: { x: window.innerWidth - 620, y: 20 },
  
  // 节点和连线数据
  nodes: initialNodes,
  edges: initialEdges,
  
  // 选中状态
  selectedNodes: [],
  selectedEdges: [],
  
  // 画布配置
  canvasConfig: {
    showGrid: true,
    gridSize: 20,
    showMinimap: true,
    showControls: true,
    fitViewOnInit: true,
  },
};

// 创建zustand store with immer
export const useConfigStore = create<ConfigPanelState & ConfigPanelActions>()(devtools(
  immer((set, get) => ({
    ...defaultConfig,
    
    // 面板操作
    togglePanel: () => set((state) => {
      state.isVisible = !state.isVisible;
    }),
    setActiveTab: (tab) => set((state) => {
      state.activeTab = tab;
    }),
    
    // 面板位置操作
    setNodePanelPosition: (position) => set((state) => {
      state.nodePanelPosition = position;
    }),
    
    setConfigPanelPosition: (position) => set((state) => {
      state.configPanelPosition = position;
    }),
    
    // 节点和连线数据操作
    setNodes: (nodes) => {
      if (typeof nodes === 'function') {
        set((state) => {
          const currentNodes = [...state.nodes];
          const newNodes = nodes(currentNodes);
          state.nodes.splice(0, state.nodes.length, ...newNodes);
        });
      } else {
        set((state) => {
          state.nodes.splice(0, state.nodes.length, ...nodes);
        });
      }
    },
    setEdges: (edges) => {
      if (typeof edges === 'function') {
        set((state) => {
          const currentEdges = [...state.edges];
          const newEdges = edges(currentEdges);
          state.edges.splice(0, state.edges.length, ...newEdges);
        });
      } else {
        set((state) => {
          state.edges.splice(0, state.edges.length, ...edges);
        });
      }
    },
    addNode: (node) => set((state) => {
      state.nodes.push(node);
    }),
    addEdge: (edge) => set((state) => {
      state.edges.push(edge);
    }),
    updateNode: (nodeId, updates) => set((state) => {
      const nodeIndex = state.nodes.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        Object.assign(state.nodes[nodeIndex], updates);
      }
    }),
    updateEdge: (edgeId, updates) => set((state) => {
      const edgeIndex = state.edges.findIndex(edge => edge.id === edgeId);
      if (edgeIndex !== -1) {
        Object.assign(state.edges[edgeIndex], updates);
      }
    }),
    deleteNode: (nodeId) => set((state) => {
      state.nodes = state.nodes.filter(node => node.id !== nodeId);
      // 同时删除相关的连线
      state.edges = state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
      // 清除选中状态
      state.selectedNodes = state.selectedNodes.filter(id => id !== nodeId);
    }),
    deleteEdge: (edgeId) => set((state) => {
      state.edges = state.edges.filter(edge => edge.id !== edgeId);
      // 清除选中状态
      state.selectedEdges = state.selectedEdges.filter(id => id !== edgeId);
    }),
    
    // 选中状态操作
    setSelectedNodes: (nodeIds) => set((state) => {
      state.selectedNodes = nodeIds;
    }),
    setSelectedEdges: (edgeIds) => set((state) => {
      state.selectedEdges = edgeIds;
    }),
    selectNode: (nodeId) => set((state) => {
      if (!state.selectedNodes.includes(nodeId)) {
        state.selectedNodes.push(nodeId);
      }
    }),
    selectEdge: (edgeId) => set((state) => {
      if (!state.selectedEdges.includes(edgeId)) {
        state.selectedEdges.push(edgeId);
      }
    }),
    unselectNode: (nodeId) => set((state) => {
      state.selectedNodes = state.selectedNodes.filter(id => id !== nodeId);
    }),
    unselectEdge: (edgeId) => set((state) => {
      state.selectedEdges = state.selectedEdges.filter(id => id !== edgeId);
    }),
    clearSelection: () => set((state) => {
      state.selectedNodes = [];
      state.selectedEdges = [];
    }),
    
    // 编辑操作
    updateNodeLabel: (nodeId, label) => set((state) => {
      const nodeIndex = state.nodes.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex].data = {
          ...state.nodes[nodeIndex].data,
          label
        };
      }
    }),
    
    updateNodeType: (nodeId, type) => set((state) => {
      const nodeIndex = state.nodes.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        // 如果类型是default，则删除type属性
        if (type === 'default') {
          const { type: _, ...nodeWithoutType } = state.nodes[nodeIndex];
          state.nodes[nodeIndex] = nodeWithoutType as Node;
        } else {
          state.nodes[nodeIndex].type = type;
        }
      }
    }),
    
    updateEdgeStyle: (edgeId, style) => set((state) => {
      const edgeIndex = state.edges.findIndex(edge => edge.id === edgeId);
      if (edgeIndex !== -1) {
        state.edges[edgeIndex].style = {
          ...state.edges[edgeIndex].style,
          ...style
        };
      }
    }),
    
    // 画布配置操作
    updateCanvasConfig: (config) => set((state) => {
      Object.assign(state.canvasConfig, config);
    }),
    
    // 重置配置
    resetConfig: () => set((state) => {
      Object.assign(state, defaultConfig);
    }),
    resetData: () => set((state) => {
      state.nodes.splice(0, state.nodes.length, ...initialNodes);
      state.edges.splice(0, state.edges.length, ...initialEdges);
      state.selectedNodes = [];
      state.selectedEdges = [];
    }),
    toggleNodePanel: () => set((state) => {
      state.nodePanelVisible = !state.nodePanelVisible;
    }),
  })),
  {
    name: 'reactflow-config-store',
  }
));