import React, { useRef, useEffect, useCallback } from 'react';
import { useCanvasStore } from '../../../../stores/canvasStore';
import styles from './MiniMap.module.less';

const MiniMap: React.FC = () => {
  const miniCanvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  
  const { elements, viewState, updateViewState } = useCanvasStore();
  
  // 小地图尺寸
  const MINIMAP_WIDTH = 200;
  const MINIMAP_HEIGHT = 150;
  
  // 计算所有元素的边界
  const getElementsBounds = useCallback(() => {
    if (elements.length === 0) {
      return { minX: -100, minY: -100, maxX: 100, maxY: 100 };
    }
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(element => {
      if (element.points && element.points.length > 0) {
        element.points.forEach(point => {
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
    
    // 添加一些边距
    const padding = 50;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };
  }, [elements]);

  // 绘制小地图
  const drawMiniMap = useCallback(() => {
    const canvas = miniCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    
    // 绘制背景
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    
    const bounds = getElementsBounds();
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    // 计算缩放比例以适应小地图
    const scaleX = MINIMAP_WIDTH / contentWidth;
    const scaleY = MINIMAP_HEIGHT / contentHeight;
    const miniScale = Math.min(scaleX, scaleY) * 0.9; // 0.9 是为了留些边距
    
    // 计算偏移量以居中显示
    const offsetX = (MINIMAP_WIDTH - contentWidth * miniScale) / 2 - bounds.minX * miniScale;
    const offsetY = (MINIMAP_HEIGHT - contentHeight * miniScale) / 2 - bounds.minY * miniScale;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(miniScale, miniScale);
    
    // 绘制所有元素（简化版）
    elements.forEach(element => {
      ctx.save();
      
      // 设置样式（简化）
      ctx.strokeStyle = element.color || '#000';
      ctx.lineWidth = Math.max(0.5, element.strokeWidth || 1);
      ctx.fillStyle = element.fill && element.fill !== 'transparent' ? element.fill : 'transparent';
      
      switch (element.type) {
        case 'pen':
          if (element.points && element.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            ctx.stroke();
          }
          break;
          
        case 'line':
          if (element.points && element.points.length >= 2) {
            const start = element.points[0];
            const end = element.points[element.points.length - 1];
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
          break;
          
        case 'rectangle':
          if (element.width && element.height) {
            ctx.beginPath();
            ctx.rect(element.x, element.y, element.width, element.height);
            if (element.fill && element.fill !== 'transparent') {
              ctx.fill();
            }
            ctx.stroke();
          }
          break;
          
        case 'circle':
          if (element.width && element.height) {
            const radiusX = Math.abs(element.width) / 2;
            const radiusY = Math.abs(element.height) / 2;
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
            if (element.fill && element.fill !== 'transparent') {
              ctx.fill();
            }
            ctx.stroke();
          }
          break;
          
        case 'text':
          if (element.text) {
            ctx.font = `${Math.max(2, element.strokeWidth * 2)}px Arial`;
            ctx.fillStyle = element.color;
            ctx.fillText(element.text, element.x, element.y);
          }
          break;
      }
      
      ctx.restore();
    });
    
    ctx.restore();
    
    // 绘制视窗区域
    drawViewport(ctx, bounds, miniScale, offsetX, offsetY);
  }, [elements, getElementsBounds, viewState]);

  // 绘制视窗区域
  const drawViewport = (
    ctx: CanvasRenderingContext2D,
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    miniScale: number,
    offsetX: number,
    offsetY: number
  ) => {
    // 计算主画布的可视区域在小地图中的位置
    const canvasWidth = window.innerWidth - 200; // 估算主画布宽度
    const canvasHeight = window.innerHeight - 150; // 估算主画布高度
    
    // 主画布视窗在世界坐标中的边界
    const viewLeft = -viewState.offsetX / viewState.scale;
    const viewTop = -viewState.offsetY / viewState.scale;
    const viewRight = viewLeft + canvasWidth / viewState.scale;
    const viewBottom = viewTop + canvasHeight / viewState.scale;
    
    // 转换到小地图坐标
    const miniViewLeft = offsetX + viewLeft * miniScale;
    const miniViewTop = offsetY + viewTop * miniScale;
    const miniViewWidth = (viewRight - viewLeft) * miniScale;
    const miniViewHeight = (viewBottom - viewTop) * miniScale;
    
    // 绘制视窗矩形
    ctx.strokeStyle = '#1890ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(miniViewLeft, miniViewTop, miniViewWidth, miniViewHeight);
    
    // 绘制半透明填充
    ctx.fillStyle = 'rgba(24, 144, 255, 0.1)';
    ctx.fillRect(miniViewLeft, miniViewTop, miniViewWidth, miniViewHeight);
  };

  // 处理小地图点击
  const handleMiniMapClick = (event: React.MouseEvent) => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const bounds = getElementsBounds();
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    const scaleX = MINIMAP_WIDTH / contentWidth;
    const scaleY = MINIMAP_HEIGHT / contentHeight;
    const miniScale = Math.min(scaleX, scaleY) * 0.9;
    
    const offsetX = (MINIMAP_WIDTH - contentWidth * miniScale) / 2 - bounds.minX * miniScale;
    const offsetY = (MINIMAP_HEIGHT - contentHeight * miniScale) / 2 - bounds.minY * miniScale;
    
    // 转换点击位置到世界坐标
    const worldX = (x - offsetX) / miniScale;
    const worldY = (y - offsetY) / miniScale;
    
    // 计算新的偏移量以将点击位置居中
    const canvasWidth = window.innerWidth - 200;
    const canvasHeight = window.innerHeight - 150;
    
    const newOffsetX = canvasWidth / 2 - worldX * viewState.scale;
    const newOffsetY = canvasHeight / 2 - worldY * viewState.scale;
    
    updateViewState({
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  };

  // 重绘小地图
  useEffect(() => {
    drawMiniMap();
  }, [drawMiniMap]);

  return (
    <div className={styles.miniMap}>
      <div className={styles.header}>预览</div>
      <canvas
        ref={miniCanvasRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className={styles.canvas}
        onClick={handleMiniMapClick}
      />
    </div>
  );
};

export default MiniMap;