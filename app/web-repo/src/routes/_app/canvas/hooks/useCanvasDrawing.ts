import { useCallback, useRef } from 'react';
import { useCanvasStore, DrawingElement } from '../../../../stores/canvasStore';
import { ElementRenderer } from '../components/ElementRenderer';
import { getElementBounds } from '../utils/geometryUtils';

export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const rendererRef = useRef<ElementRenderer | null>(null);
  
  const {
    elements,
    currentTool,
    viewState,
    selectedElementIds,
  } = useCanvasStore();

  // 获取或创建渲染器
  const getRenderer = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return null;

    if (!rendererRef.current) {
      rendererRef.current = new ElementRenderer(ctx);
    }
    return rendererRef.current;
  }, [canvasRef]);

  // 绘制所有元素
  const drawElements = useCallback((
    currentDrawing?: DrawingElement | null,
    eraserPreview?: { x: number; y: number; radius: number } | null
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const renderer = getRenderer();
    
    if (!canvas || !ctx || !renderer) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置变换矩阵
    ctx.save();
    ctx.translate(viewState.offsetX, viewState.offsetY);
    ctx.scale(viewState.scale, viewState.scale);

    // 绘制网格
    renderer.drawGrid(canvasRef, viewState);

    // 绘制所有元素
    const allElements = [...elements, ...(currentDrawing ? [currentDrawing] : [])];
    allElements.forEach(element => {
      renderer.drawElement(element);
      
      // 绘制选中状态
      if (selectedElementIds.includes(element.id)) {
        renderer.drawSelection(element, viewState.scale, getElementBounds);
      }
    });

    // 绘制橡皮擦预览
    if (eraserPreview && currentTool === 'eraser') {
      renderer.drawEraserPreview(eraserPreview, viewState.scale);
    }

    ctx.restore();
  }, [canvasRef, getRenderer, elements, viewState, selectedElementIds, currentTool]);

  // 调整画布大小
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { clientWidth, clientHeight } = container;
    canvas.width = clientWidth;
    canvas.height = clientHeight;
  }, [canvasRef, containerRef]);

  return {
    drawElements,
    resizeCanvas,
  };
};