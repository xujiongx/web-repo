import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { useCanvasStore, DrawingElement } from '../../../../stores/canvasStore';
import { useCanvasDrawing } from '../hooks/useCanvasDrawing';
import { useCanvasEvents } from '../hooks/useCanvasEvents';
import styles from './Canvas.module.less';

const Canvas = forwardRef<HTMLCanvasElement>((props, ref) => {
  const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 组件状态
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [currentDrawing, setCurrentDrawing] = useState<DrawingElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [eraserPreview, setEraserPreview] = useState<{ x: number; y: number; radius: number } | null>(null);

  // Store 状态
  const { currentTool } = useCanvasStore();

  // 使用自定义 hooks
  const { drawElements, resizeCanvas } = useCanvasDrawing(canvasRef, containerRef);
  
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleKeyDown,
    handleKeyUp,
    handleMouseEnter,
    handleMouseLeave,
  } = useCanvasEvents(
    canvasRef,
    isMouseDown,
    setIsMouseDown,
    lastMousePos,
    setLastMousePos,
    currentDrawing,
    setCurrentDrawing,
    isDragging,
    setIsDragging,
    eraserPreview,
    setEraserPreview
  );

  // 事件监听器设置
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // 为滚轮事件添加非被动监听器，以支持preventDefault
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel as any, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel as any);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleKeyDown, handleKeyUp, handleWheel]);

  // 重绘画布
  useEffect(() => {
    drawElements(currentDrawing, eraserPreview);
  }, [drawElements, currentDrawing, eraserPreview]);

  // 调整画布大小
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
      drawElements(currentDrawing, eraserPreview);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeCanvas, drawElements, currentDrawing, eraserPreview]);

  return (
    <div 
      ref={containerRef}
      className={`${styles.canvasContainer} ${isDragging ? styles.dragging : ''}`}
      data-tool={currentTool}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;