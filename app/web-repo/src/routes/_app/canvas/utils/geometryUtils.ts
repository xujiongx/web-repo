import { DrawingElement } from '../../../../stores/canvasStore';

// 计算点到线段的距离
export const distanceToLineSegment = (
  px: number, 
  py: number, 
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) {
    // 线段退化为点
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  }
  
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  
  return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
};

// 获取元素边界
export const getElementBounds = (element: DrawingElement) => {
  switch (element.type) {
    case 'rectangle':
      if (element.width && element.height) {
        return {
          x: Math.min(element.x, element.x + element.width),
          y: Math.min(element.y, element.y + element.height),
          width: Math.abs(element.width),
          height: Math.abs(element.height),
        };
      }
      break;
    case 'circle':
      if (element.width && element.height) {
        return {
          x: Math.min(element.x, element.x + element.width),
          y: Math.min(element.y, element.y + element.height),
          width: Math.abs(element.width),
          height: Math.abs(element.height),
        };
      }
      break;
    case 'pen':
    case 'line':
      if (element.points && element.points.length > 0) {
        const xs = element.points.map((p: { x: number; y: number }) => p.x);
        const ys = element.points.map((p: { x: number; y: number }) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const padding = element.strokeWidth / 2 + 5; // 增加选择区域
        return {
          x: minX - padding,
          y: minY - padding,
          width: maxX - minX + padding * 2,
          height: maxY - minY + padding * 2,
        };
      }
      break;
    case 'text':
      if (element.text) {
        const fontSize = element.strokeWidth * 8;
        const textWidth = element.text.length * fontSize * 0.6; // 估算文本宽度
        return {
          x: element.x,
          y: element.y - fontSize,
          width: textWidth,
          height: fontSize + 5,
        };
      }
      break;
    case 'image':
    case 'video':
      if (element.width && element.height) {
        return {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        };
      }
      break;
  }
  return null;
};

// 检测点击的元素
export const getElementAt = (x: number, y: number, elements: DrawingElement[]): string | null => {
  // 从后向前遍历，优先选择上层元素
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    
    // 特殊处理圆形的点击检测
    if (element.type === 'circle' && element.width && element.height) {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const radiusX = Math.abs(element.width) / 2;
      const radiusY = Math.abs(element.height) / 2;
      
      // 检查点是否在椭圆内
      const dx = (x - centerX) / radiusX;
      const dy = (y - centerY) / radiusY;
      if (dx * dx + dy * dy <= 1) {
        return element.id;
      }
      continue;
    }
    
    // 特殊处理线条的点击检测
    if ((element.type === 'pen' || element.type === 'line') && element.points) {
      const threshold = Math.max(element.strokeWidth / 2 + 3, 5); // 最小5像素的选择范围
      
      for (let j = 0; j < element.points.length - 1; j++) {
        const p1 = element.points[j];
        const p2 = element.points[j + 1];
        
        // 计算点到线段的距离
        const distance = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
        if (distance <= threshold) {
          return element.id;
        }
      }
      continue;
    }
    
    // 通用边界检测
    const bounds = getElementBounds(element);
    if (bounds && 
        x >= bounds.x && 
        x <= bounds.x + bounds.width &&
        y >= bounds.y && 
        y <= bounds.y + bounds.height) {
      return element.id;
    }
  }
  return null;
};

// 生成唯一ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// 获取鼠标在画布上的坐标
export const getMousePos = (
  event: MouseEvent | React.MouseEvent,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  viewState: { offsetX: number; offsetY: number; scale: number }
) => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left - viewState.offsetX) / viewState.scale;
  const y = (event.clientY - rect.top - viewState.offsetY) / viewState.scale;
  
  return { x, y };
};