import { useRef, useCallback, useEffect, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface UseDraggableOptions {
  initialPosition: Position;
  onPositionChange: (position: Position) => void;
  disabled?: boolean;
  bounds?: Bounds; // 自定义边界
  constrainToViewport?: boolean; // 是否限制在视口内
}

export const useDraggable = ({ 
  initialPosition, 
  onPositionChange, 
  disabled = false,
  bounds,
  constrainToViewport = true
}: UseDraggableOptions) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const elementStart = useRef<Position>(initialPosition);
  const [elementSize, setElementSize] = useState({ width: 0, height: 0 });

  // 获取元素尺寸
  const updateElementSize = useCallback(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setElementSize({ width: rect.width, height: rect.height });
    }
  }, []);

  // 计算有效边界
  const getEffectiveBounds = useCallback((): Bounds => {
    if (bounds) {
      return bounds;
    }
    
    if (constrainToViewport) {
      return {
        minX: 0,
        maxX: Math.max(0, window.innerWidth - elementSize.width),
        minY: 0,
        maxY: Math.max(0, window.innerHeight - elementSize.height)
      };
    }
    
    // 无边界限制
    return {
      minX: Number.NEGATIVE_INFINITY,
      maxX: Number.POSITIVE_INFINITY,
      minY: Number.NEGATIVE_INFINITY,
      maxY: Number.POSITIVE_INFINITY
    };
  }, [bounds, constrainToViewport, elementSize]);

  // 应用边界约束
  const constrainPosition = useCallback((position: Position): Position => {
    const effectiveBounds = getEffectiveBounds();
    
    return {
      x: Math.max(effectiveBounds.minX, Math.min(effectiveBounds.maxX, position.x)),
      y: Math.max(effectiveBounds.minY, Math.min(effectiveBounds.maxY, position.y))
    };
  }, [getEffectiveBounds]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    elementStart.current = initialPosition;
    
    // 确保元素尺寸是最新的
    updateElementSize();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [initialPosition, disabled, updateElementSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    const newPosition = {
      x: elementStart.current.x + deltaX,
      y: elementStart.current.y + deltaY
    };
    
    const constrainedPosition = constrainPosition(newPosition);
    onPositionChange(constrainedPosition);
  }, [onPositionChange, constrainPosition]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // 监听窗口大小变化，重新计算边界
  useEffect(() => {
    const handleResize = () => {
      updateElementSize();
      // 重新约束当前位置
      const constrainedPosition = constrainPosition(initialPosition);
      if (constrainedPosition.x !== initialPosition.x || constrainedPosition.y !== initialPosition.y) {
        onPositionChange(constrainedPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    // 初始化时获取元素尺寸
    updateElementSize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initialPosition, onPositionChange, constrainPosition, updateElementSize]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    elementRef,
    handleMouseDown,
    isDragging: isDragging.current
  };
};