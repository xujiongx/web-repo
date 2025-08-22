import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 绘制工具类型
export type DrawingTool = 'pen' | 'line' | 'rectangle' | 'circle' | 'text' | 'eraser' | 'select' | 'image' | 'video';

// 绘制元素接口
export interface DrawingElement {
  id: string;
  type: DrawingTool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  color: string;
  strokeWidth: number;
  fill?: string;
  // 图片和视频元素属性
  src?: string; // 图片/视频源地址
  file?: File; // 原始文件对象
  naturalWidth?: number; // 原始宽度
  naturalHeight?: number; // 原始高度
  isPlaying?: boolean; // 视频播放状态
}

// 画布视图状态
export interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// 画布状态接口
interface CanvasState {
  // 状态
  elements: DrawingElement[];
  selectedElementIds: string[];
  currentTool: DrawingTool;
  currentColor: string;
  currentStrokeWidth: number;
  currentFill: string;
  viewState: ViewState;
  isDrawing: boolean;
  isPanning: boolean; // 新增：是否正在平移画布
  isSpacePressed: boolean; // 新增：是否按住空格键
  
  // 操作方法
  addElement: (element: DrawingElement) => void;
  updateElement: (id: string, updates: Partial<DrawingElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  selectElement: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setTool: (tool: DrawingTool) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFill: (fill: string) => void;
  updateViewState: (updates: Partial<ViewState>) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setIsPanning: (isPanning: boolean) => void; // 新增
  setIsSpacePressed: (isPressed: boolean) => void; // 新增
  clearCanvas: () => void;
  eraseAtPoint: (x: number, y: number, radius: number) => void; // 新增：局部擦除
  scaleSelectedElements: (scaleFactor: number, centerX: number, centerY: number) => void; // 新增：缩放选中元素
  
  // 媒体相关功能
  importImage: (file: File, x: number, y: number) => Promise<void>;
  importVideo: (file: File, x: number, y: number) => Promise<void>;
  exportAsImage: (canvasElement: HTMLCanvasElement) => void;
  
  // 撤销/重做（简化版）
  undo: () => void;
  redo: () => void;
  history: DrawingElement[][];
  historyIndex: number;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      // 初始状态
      elements: [],
      selectedElementIds: [],
      currentTool: 'pen',
      currentColor: '#000000',
      currentStrokeWidth: 2,
      currentFill: 'transparent',
      viewState: {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      },
      isDrawing: false,
      isPanning: false,
      isSpacePressed: false,
      history: [[]],
      historyIndex: 0,

      // 添加元素
      addElement: (element) => {
        const state = get();
        const newElements = [...state.elements, element];
        set({
          elements: newElements,
          history: [...state.history.slice(0, state.historyIndex + 1), newElements],
          historyIndex: state.historyIndex + 1,
        });
      },

      // 更新元素
      updateElement: (id, updates) => {
        const state = get();
        const newElements = state.elements.map(el =>
          el.id === id ? { ...el, ...updates } : el
        );
        set({ elements: newElements });
      },

      // 删除元素
      deleteElement: (id) => {
        const state = get();
        const newElements = state.elements.filter(el => el.id !== id);
        set({
          elements: newElements,
          selectedElementIds: state.selectedElementIds.filter(selectedId => selectedId !== id),
          history: [...state.history.slice(0, state.historyIndex + 1), newElements],
          historyIndex: state.historyIndex + 1,
        });
      },

      // 删除选中元素
      deleteSelectedElements: () => {
        const state = get();
        const newElements = state.elements.filter(
          el => !state.selectedElementIds.includes(el.id)
        );
        set({
          elements: newElements,
          selectedElementIds: [],
          history: [...state.history.slice(0, state.historyIndex + 1), newElements],
          historyIndex: state.historyIndex + 1,
        });
      },

      // 选择元素
      selectElement: (id, multiSelect = false) => {
        const state = get();
        let newSelectedIds: string[];
        
        if (multiSelect) {
          newSelectedIds = state.selectedElementIds.includes(id)
            ? state.selectedElementIds.filter(selectedId => selectedId !== id)
            : [...state.selectedElementIds, id];
        } else {
          newSelectedIds = [id];
        }
        
        set({ selectedElementIds: newSelectedIds });
      },

      // 清除选择
      clearSelection: () => {
        set({ selectedElementIds: [] });
      },

      // 设置工具
      setTool: (tool) => {
        set({ currentTool: tool });
        // 切换工具时清除选择
        if (tool !== 'select') {
          get().clearSelection();
        }
      },

      // 设置颜色
      setColor: (color) => {
        set({ currentColor: color });
      },

      // 设置笔触宽度
      setStrokeWidth: (width) => {
        set({ currentStrokeWidth: width });
      },

      // 设置填充
      setFill: (fill) => {
        set({ currentFill: fill });
      },

      // 更新视图状态
      updateViewState: (updates) => {
        const state = get();
        set({
          viewState: { ...state.viewState, ...updates }
        });
      },

      // 设置绘制状态
      setIsDrawing: (isDrawing) => {
        set({ isDrawing });
      },

      // 设置平移状态
      setIsPanning: (isPanning) => {
        set({ isPanning });
      },

      // 设置空格键状态
      setIsSpacePressed: (isPressed) => {
        set({ isSpacePressed: isPressed });
      },

      // 清空画布
      clearCanvas: () => {
        const state = get();
        set({
          elements: [],
          selectedElementIds: [],
          history: [...state.history.slice(0, state.historyIndex + 1), []],
          historyIndex: state.historyIndex + 1,
        });
      },

      // 局部擦除功能
      eraseAtPoint: (x, y, radius) => {
        const state = get();
        let hasChanges = false;
        const newElements: DrawingElement[] = [];
        
        state.elements.forEach(element => {
          if (element.type === 'pen' && element.points) {
            // 对于画笔笔画，实现智能分割擦除
            const segments = splitPenStrokeByErase(element.points, x, y, radius);
            
            if (segments.length === 1 && segments[0].length === element.points.length) {
              // 没有被擦除，保持原元素
              newElements.push(element);
            } else if (segments.length > 0) {
              // 被擦除后产生了新的片段
              hasChanges = true;
              segments.forEach((segment, index) => {
                if (segment.length >= 2) {
                  newElements.push({
                    ...element,
                    id: index === 0 ? element.id : `${element.id}_split_${index}`,
                    points: segment
                  });
                }
              });
            } else {
              // 整个笔画被擦除
              hasChanges = true;
            }
          } else if (element.type === 'line' && element.points && element.points.length >= 2) {
            // 对于线条，检查擦除点是否与线条相交
            const start = element.points[0];
            const end = element.points[element.points.length - 1];
            const distanceToLine = distancePointToLineSegment(x, y, start.x, start.y, end.x, end.y);
            
            if (distanceToLine <= radius) {
              hasChanges = true;
              // 不添加到newElements，即删除
            } else {
              newElements.push(element);
            }
          } else if (element.type === 'circle' && element.width && element.height) {
            // 对于圆形，精确检查是否在椭圆内部
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            const radiusX = Math.abs(element.width) / 2;
            const radiusY = Math.abs(element.height) / 2;
            
            // 使用椭圆方程检查点是否在椭圆内
            const dx = (x - centerX) / radiusX;
            const dy = (y - centerY) / radiusY;
            const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
            
            if (distanceFromCenter <= 1 + radius / Math.min(radiusX, radiusY)) {
              hasChanges = true;
              // 不添加到newElements，即删除
            } else {
              newElements.push(element);
            }
          } else if (element.type === 'rectangle') {
            // 对于矩形，检查擦除点是否在矩形内部或边缘附近
            const bounds = {
              x: Math.min(element.x, element.x + (element.width || 0)),
              y: Math.min(element.y, element.y + (element.height || 0)),
              width: Math.abs(element.width || 0),
              height: Math.abs(element.height || 0)
            };
            
            // 检查擦除点是否在矩形边界内（包含容差）
            if (x >= bounds.x - radius && x <= bounds.x + bounds.width + radius &&
                y >= bounds.y - radius && y <= bounds.y + bounds.height + radius) {
              hasChanges = true;
              // 不添加到newElements，即删除
            } else {
              newElements.push(element);
            }
          } else if (element.type === 'text') {
            // 对于文字，检查擦除点是否在文字范围内
            const fontSize = element.strokeWidth * 8;
            const textWidth = (element.text?.length || 0) * fontSize * 0.6;
            
            if (x >= element.x - radius && x <= element.x + textWidth + radius &&
                y >= element.y - fontSize - radius && y <= element.y + radius) {
              hasChanges = true;
              // 不添加到newElements，即删除
            } else {
              newElements.push(element);
            }
          } else if (element.type === 'image' || element.type === 'video') {
            // 对于图片和视频，检查擦除点是否在元素范围内
            if (element.width && element.height) {
              if (x >= element.x - radius && x <= element.x + element.width + radius &&
                  y >= element.y - radius && y <= element.y + element.height + radius) {
                hasChanges = true;
                // 删除元素时清理资源
                if (element.src) {
                  URL.revokeObjectURL(element.src);
                }
                if (element.type === 'video') {
                  const video = document.getElementById(`video-${element.id}`);
                  if (video) {
                    document.body.removeChild(video);
                  }
                }
                // 不添加到newElements，即删除
              } else {
                newElements.push(element);
              }
            } else {
              newElements.push(element);
            }
          } else {
            // 其他元素类型保持不变
            newElements.push(element);
          }
        });

        if (hasChanges) {
          set({
            elements: newElements,
            history: [...state.history.slice(0, state.historyIndex + 1), newElements],
            historyIndex: state.historyIndex + 1,
          });
        }
      },

      // 缩放选中元素
      scaleSelectedElements: (scaleFactor, centerX, centerY) => {
        const state = get();
        const newElements = state.elements.map(element => {
          if (state.selectedElementIds.includes(element.id)) {
            const newElement = { ...element };
            
            // 计算相对于缩放中心的位置
            const relativeX = element.x - centerX;
            const relativeY = element.y - centerY;
            
            newElement.x = centerX + relativeX * scaleFactor;
            newElement.y = centerY + relativeY * scaleFactor;
            
            if (element.width !== undefined) {
              newElement.width = element.width * scaleFactor;
            }
            if (element.height !== undefined) {
              newElement.height = element.height * scaleFactor;
            }
            
            // 对于有点集合的元素
            if (element.points) {
              newElement.points = element.points.map(point => ({
                x: centerX + (point.x - centerX) * scaleFactor,
                y: centerY + (point.y - centerY) * scaleFactor,
              }));
            }
            
            // 缩放笔触宽度
            newElement.strokeWidth = element.strokeWidth * scaleFactor;
            
            return newElement;
          }
          return element;
        });
        
        set({ elements: newElements });
      },

      // 撤销
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          set({
            elements: state.history[newIndex],
            historyIndex: newIndex,
            selectedElementIds: [],
          });
        }
      },

      // 重做
      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          set({
            elements: state.history[newIndex],
            historyIndex: newIndex,
            selectedElementIds: [],
          });
        }
      },

      // 导入图片
      importImage: async (file: File, x: number, y: number) => {
        const src = URL.createObjectURL(file);
        
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const maxSize = 300; // 默认最大尺寸
            
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            
            // 缩放到合适尺寸
            if (width > maxSize || height > maxSize) {
              if (aspectRatio > 1) {
                width = maxSize;
                height = maxSize / aspectRatio;
              } else {
                height = maxSize;
                width = maxSize * aspectRatio;
              }
            }
            
            const newElement: DrawingElement = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'image',
              x: x - width / 2, // 以中心点为基准
              y: y - height / 2,
              width,
              height,
              src,
              file,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              color: '#000000',
              strokeWidth: 0,
            };
            
            get().addElement(newElement);
            resolve();
          };
          
          img.onerror = () => {
            URL.revokeObjectURL(src);
            reject(new Error('图片加载失败'));
          };
          
          img.src = src;
        });
      },

      // 导入视频
      importVideo: async (file: File, x: number, y: number) => {
        const src = URL.createObjectURL(file);
        
        return new Promise((resolve, reject) => {
          const video = document.createElement('video');
          video.onloadedmetadata = () => {
            const aspectRatio = video.videoWidth / video.videoHeight;
            const maxSize = 300; // 默认最大尺寸
            
            let width = video.videoWidth;
            let height = video.videoHeight;
            
            // 缩放到合适尺寸
            if (width > maxSize || height > maxSize) {
              if (aspectRatio > 1) {
                width = maxSize;
                height = maxSize / aspectRatio;
              } else {
                height = maxSize;
                width = maxSize * aspectRatio;
              }
            }
            
            const newElement: DrawingElement = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'video',
              x: x - width / 2, // 以中心点为基准
              y: y - height / 2,
              width,
              height,
              src,
              file,
              naturalWidth: video.videoWidth,
              naturalHeight: video.videoHeight,
              isPlaying: false,
              color: '#000000',
              strokeWidth: 0,
            };
            
            get().addElement(newElement);
            resolve();
          };
          
          video.onerror = () => {
            URL.revokeObjectURL(src);
            reject(new Error('视频加载失败'));
          };
          
          video.src = src;
        });
      },

      // 导出为图片
      exportAsImage: (canvasElement: HTMLCanvasElement) => {
        try {
          // 创建一个新的高分辨率画布
          const exportCanvas = document.createElement('canvas');
          const exportCtx = exportCanvas.getContext('2d');
          if (!exportCtx) return;
          
          const state = get();
          const scale = 2; // 高分辨率导出
          
          // 计算所有元素的边界
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          
          if (state.elements.length === 0) {
            // 如果没有元素，使用默认尺寸
            minX = 0;
            minY = 0;
            maxX = 800;
            maxY = 600;
          } else {
            state.elements.forEach(element => {
              if (element.type === 'pen' || element.type === 'line') {
                element.points?.forEach(point => {
                  minX = Math.min(minX, point.x);
                  minY = Math.min(minY, point.y);
                  maxX = Math.max(maxX, point.x);
                  maxY = Math.max(maxY, point.y);
                });
              } else {
                minX = Math.min(minX, element.x);
                minY = Math.min(minY, element.y);
                maxX = Math.max(maxX, element.x + (element.width || 0));
                maxY = Math.max(maxY, element.y + (element.height || 0));
              }
            });
          }
          
          // 添加一些内边距
          const padding = 50;
          minX -= padding;
          minY -= padding;
          maxX += padding;
          maxY += padding;
          
          const exportWidth = (maxX - minX) * scale;
          const exportHeight = (maxY - minY) * scale;
          
          exportCanvas.width = exportWidth;
          exportCanvas.height = exportHeight;
          
          // 设置背景色
          exportCtx.fillStyle = '#ffffff';
          exportCtx.fillRect(0, 0, exportWidth, exportHeight);
          
          // 设置变换
          exportCtx.scale(scale, scale);
          exportCtx.translate(-minX, -minY);
          
          // 绘制所有元素
          const promises = state.elements.map(element => {
            return new Promise<void>((resolve) => {
              exportCtx.save();
              exportCtx.strokeStyle = element.color;
              exportCtx.lineWidth = element.strokeWidth;
              exportCtx.fillStyle = element.fill || 'transparent';
              
              switch (element.type) {
                case 'pen':
                  if (element.points && element.points.length > 1) {
                    exportCtx.beginPath();
                    exportCtx.moveTo(element.points[0].x, element.points[0].y);
                    for (let i = 1; i < element.points.length; i++) {
                      exportCtx.lineTo(element.points[i].x, element.points[i].y);
                    }
                    exportCtx.stroke();
                  }
                  resolve();
                  break;
                  
                case 'line':
                  if (element.points && element.points.length >= 2) {
                    const start = element.points[0];
                    const end = element.points[element.points.length - 1];
                    exportCtx.beginPath();
                    exportCtx.moveTo(start.x, start.y);
                    exportCtx.lineTo(end.x, end.y);
                    exportCtx.stroke();
                  }
                  resolve();
                  break;
                  
                case 'rectangle':
                  if (element.width && element.height) {
                    exportCtx.beginPath();
                    exportCtx.rect(element.x, element.y, element.width, element.height);
                    if (element.fill && element.fill !== 'transparent') {
                      exportCtx.fill();
                    }
                    exportCtx.stroke();
                  }
                  resolve();
                  break;
                  
                case 'circle':
                  if (element.width && element.height) {
                    const radiusX = Math.abs(element.width) / 2;
                    const radiusY = Math.abs(element.height) / 2;
                    const centerX = element.x + element.width / 2;
                    const centerY = element.y + element.height / 2;
                    
                    exportCtx.beginPath();
                    exportCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    if (element.fill && element.fill !== 'transparent') {
                      exportCtx.fill();
                    }
                    exportCtx.stroke();
                  }
                  resolve();
                  break;
                  
                case 'text':
                  if (element.text) {
                    exportCtx.font = `${element.strokeWidth * 8}px Arial`;
                    exportCtx.fillStyle = element.color;
                    exportCtx.fillText(element.text, element.x, element.y);
                  }
                  resolve();
                  break;
                  
                case 'image':
                  if (element.src && element.width && element.height) {
                    const img = new Image();
                    img.onload = () => {
                      exportCtx.drawImage(img, element.x, element.y, element.width!, element.height!);
                      resolve();
                    };
                    img.onerror = () => resolve();
                    img.src = element.src!;
                  } else {
                    resolve();
                  }
                  break;
                  
                case 'video':
                  if (element.src && element.width && element.height) {
                    // 对于视频，绘制一个占位符
                    exportCtx.fillStyle = '#f0f0f0';
                    exportCtx.fillRect(element.x, element.y, element.width, element.height);
                    exportCtx.strokeStyle = '#ccc';
                    exportCtx.strokeRect(element.x, element.y, element.width, element.height);
                    
                    // 绘制播放图标
                    const centerX = element.x + element.width / 2;
                    const centerY = element.y + element.height / 2;
                    const playIconSize = Math.min(element.width, element.height) * 0.2;
                    
                    exportCtx.fillStyle = '#666';
                    exportCtx.beginPath();
                    exportCtx.moveTo(centerX - playIconSize / 2, centerY - playIconSize / 2);
                    exportCtx.lineTo(centerX + playIconSize / 2, centerY);
                    exportCtx.lineTo(centerX - playIconSize / 2, centerY + playIconSize / 2);
                    exportCtx.closePath();
                    exportCtx.fill();
                  }
                  resolve();
                  break;
                  
                default:
                  resolve();
                  break;
              }
              
              exportCtx.restore();
            });
          });
          
          // 等待所有元素绘制完成
          Promise.all(promises).then(() => {
            // 下载图片
            exportCanvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `canvas-export-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }, 'image/png');
          });
          
        } catch (error) {
          console.error('导出图片失败:', error);
        }
      },
    }),
    {
      name: 'canvas-storage',
      partialize: (state) => ({
        elements: state.elements,
        viewState: state.viewState,
        currentTool: state.currentTool,
        currentColor: state.currentColor,
        currentStrokeWidth: state.currentStrokeWidth,
        currentFill: state.currentFill,
      }),
    }
  )
);

// 辅助函数：计算点到线段的距离
function distancePointToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) {
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  }
  
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  
  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
}

// 辅助函数：智能分割画笔笔画
function splitPenStrokeByErase(
  points: { x: number; y: number }[], 
  eraseX: number, 
  eraseY: number, 
  eraseRadius: number
): { x: number; y: number }[][] {
  const segments: { x: number; y: number }[][] = [];
  let currentSegment: { x: number; y: number }[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const distance = Math.sqrt((point.x - eraseX) ** 2 + (point.y - eraseY) ** 2);
    
    if (distance <= eraseRadius) {
      // 这个点在擦除范围内，结束当前片段
      if (currentSegment.length >= 2) {
        segments.push([...currentSegment]);
      }
      currentSegment = [];
    } else {
      // 这个点不在擦除范围内，添加到当前片段
      currentSegment.push(point);
    }
  }
  
  // 添加最后一个片段
  if (currentSegment.length >= 2) {
    segments.push(currentSegment);
  }
  
  return segments;
}