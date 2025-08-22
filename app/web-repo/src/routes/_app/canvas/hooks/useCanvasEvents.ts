import { useCallback, useRef } from 'react';
import { useCanvasStore, DrawingElement } from '../../../../stores/canvasStore';
import { getMousePos, getElementAt, generateId } from '../utils/geometryUtils';

export const useCanvasEvents = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isMouseDown: boolean,
  setIsMouseDown: (value: boolean) => void,
  lastMousePos: { x: number; y: number },
  setLastMousePos: (pos: { x: number; y: number }) => void,
  currentDrawing: DrawingElement | null,
  setCurrentDrawing: (element: DrawingElement | null) => void,
  isDragging: boolean,
  setIsDragging: (value: boolean) => void,
  eraserPreview: { x: number; y: number; radius: number } | null,
  setEraserPreview: (preview: { x: number; y: number; radius: number } | null) => void
) => {
  const lastEraseTimeRef = useRef<number>(0);
  const ERASE_THROTTLE_MS = 16; // 限制擦除频率为60fps

  const {
    elements,
    currentTool,
    currentColor,
    currentStrokeWidth,
    currentFill,
    viewState,
    selectedElementIds,
    isPanning,
    isSpacePressed,
    addElement,
    updateElement,
    selectElement,
    clearSelection,
    updateViewState,
    setIsDrawing,
    setIsPanning,
    setIsSpacePressed,
    eraseAtPoint,
    scaleSelectedElements,
  } = useCanvasStore();

  // 鼠标按下事件
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    const pos = getMousePos(event, canvasRef, viewState);
    setIsMouseDown(true);
    
    // 空格键 + 鼠标左键 = 平移画布
    if (isSpacePressed) {
      setLastMousePos({ x: event.clientX, y: event.clientY });
      setIsPanning(true);
      return;
    }

    setLastMousePos(pos);
    setIsDrawing(true);

    // 橡皮擦功能：局部擦除
    if (currentTool === 'eraser') {
      const eraseRadius = currentStrokeWidth * 3;
      const now = Date.now();
      if (now - lastEraseTimeRef.current >= ERASE_THROTTLE_MS) {
        eraseAtPoint(pos.x, pos.y, eraseRadius);
        lastEraseTimeRef.current = now;
      }
      return;
    }

    // 选择工具
    if (currentTool === 'select') {
      const elementId = getElementAt(pos.x, pos.y, elements);
      if (elementId) {
        const element = elements.find(el => el.id === elementId);
        
        // 如果点击的是视频元素，切换播放状态
        if (element?.type === 'video' && element.src) {
          const video = document.getElementById(`video-${element.id}`) as HTMLVideoElement;
          if (video) {
            if (element.isPlaying) {
              video.pause();
            } else {
              video.play();
            }
            updateElement(elementId, { isPlaying: !element.isPlaying });
          }
        }
        
        // 如果点击的是已选中的元素，开始拖拽
        if (selectedElementIds.includes(elementId)) {
          setIsDragging(true);
        } else {
          // 选择新元素
          selectElement(elementId, event.ctrlKey || event.metaKey);
        }
      } else {
        // 点击空白处，清除选择
        clearSelection();
      }
      return;
    }

    // 开始绘制新元素
    const newElement: DrawingElement = {
      id: generateId(),
      type: currentTool,
      x: pos.x,
      y: pos.y,
      color: currentColor,
      strokeWidth: currentStrokeWidth,
      fill: currentFill,
      points: currentTool === 'pen' || currentTool === 'line' ? [pos] : undefined,
    };

    if (currentTool === 'text') {
      const text = prompt('输入文字:');
      if (text) {
        newElement.text = text;
        addElement(newElement);
      }
      setIsDrawing(false);
      return;
    }

    setCurrentDrawing(newElement);
  }, [
    canvasRef, viewState, isSpacePressed, currentTool, currentStrokeWidth, elements,
    selectedElementIds, currentColor, currentFill, setIsMouseDown, setLastMousePos,
    setIsPanning, setIsDrawing, setIsDragging, eraseAtPoint, selectElement,
    clearSelection, updateElement, addElement, setCurrentDrawing
  ]);

  // 鼠标移动事件
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const pos = getMousePos(event, canvasRef, viewState);

    // 更新橡皮擦预览
    if (currentTool === 'eraser') {
      const eraseRadius = currentStrokeWidth * 3;
      setEraserPreview({ x: pos.x, y: pos.y, radius: eraseRadius });
    } else {
      setEraserPreview(null);
    }

    // 平移画布
    if (isPanning && isMouseDown) {
      const deltaX = (event.clientX - lastMousePos.x);
      const deltaY = (event.clientY - lastMousePos.y);
      
      updateViewState({
        offsetX: viewState.offsetX + deltaX,
        offsetY: viewState.offsetY + deltaY,
      });
      
      setLastMousePos({ x: event.clientX, y: event.clientY });
      return;
    }

    // 橡皮擦功能：鼠标移动时继续局部擦除
    if (isMouseDown && currentTool === 'eraser') {
      const eraseRadius = currentStrokeWidth * 3;
      const now = Date.now();
      if (now - lastEraseTimeRef.current >= ERASE_THROTTLE_MS) {
        eraseAtPoint(pos.x, pos.y, eraseRadius);
        lastEraseTimeRef.current = now;
      }
      return;
    }

    // 拖拽选中的元素
    if (isDragging && selectedElementIds.length > 0) {
      const deltaX = pos.x - lastMousePos.x;
      const deltaY = pos.y - lastMousePos.y;
      
      selectedElementIds.forEach(id => {
        const element = elements.find(el => el.id === id);
        if (element) {
          // 更新元素位置
          const updates: Partial<DrawingElement> = {
            x: element.x + deltaX,
            y: element.y + deltaY,
          };
          
          // 对于有点集合的元素（线条、画笔），同时移动所有点
          if (element.points) {
            updates.points = element.points.map(p => ({
              x: p.x + deltaX,
              y: p.y + deltaY,
            }));
          }
          
          updateElement(id, updates);
        }
      });
      
      setLastMousePos(pos);
      return;
    }

    // 绘制功能
    if (!isMouseDown || !currentDrawing) return;

    if (currentTool === 'pen') {
      setCurrentDrawing({
        ...currentDrawing,
        points: [...(currentDrawing.points || []), pos]
      });
    } else if (currentTool === 'line') {
      setCurrentDrawing({
        ...currentDrawing,
        points: [currentDrawing.points![0], pos]
      });
    } else if (currentTool === 'rectangle' || currentTool === 'circle') {
      const width = pos.x - currentDrawing.x;
      const height = pos.y - currentDrawing.y;
      setCurrentDrawing({
        ...currentDrawing,
        width,
        height
      });
    }
  }, [
    canvasRef, viewState, currentTool, currentStrokeWidth, isMouseDown, isPanning,
    isDragging, selectedElementIds, elements, lastMousePos, currentDrawing,
    setEraserPreview, updateViewState, setLastMousePos, eraseAtPoint,
    updateElement, setCurrentDrawing
  ]);

  // 鼠标释放事件
  const handleMouseUp = useCallback(() => {
    if (currentDrawing && isMouseDown) {
      addElement(currentDrawing);
      setCurrentDrawing(null);
    }
    
    setIsMouseDown(false);
    setIsDrawing(false);
    setIsDragging(false);
    setIsPanning(false);
  }, [currentDrawing, isMouseDown, addElement, setCurrentDrawing, setIsMouseDown, setIsDrawing, setIsDragging, setIsPanning]);

  // 鼠标滚轮缩放
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    
    // 如果按住 Ctrl 键并且有选中元素，缩放选中元素
    if ((event.ctrlKey || event.metaKey) && selectedElementIds.length > 0) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = (event.clientX - rect.left - viewState.offsetX) / viewState.scale;
      const mouseY = (event.clientY - rect.top - viewState.offsetY) / viewState.scale;
      
      scaleSelectedElements(delta, mouseX, mouseY);
      return;
    }
    
    // 缩放画布（拓展缩放范围）
    const newScale = Math.max(0.01, Math.min(50, viewState.scale * delta));
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const newOffsetX = mouseX - (mouseX - viewState.offsetX) * (newScale / viewState.scale);
    const newOffsetY = mouseY - (mouseY - viewState.offsetY) * (newScale / viewState.scale);
    
    updateViewState({
      scale: newScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  }, [canvasRef, selectedElementIds, viewState, scaleSelectedElements, updateViewState]);

  // 键盘事件
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete' && selectedElementIds.length > 0) {
      useCanvasStore.getState().deleteSelectedElements();
    }
    
    if (event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
      setIsSpacePressed(true);
    }
  }, [selectedElementIds, setIsSpacePressed]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.key === ' ' || event.code === 'Space') {
      setIsSpacePressed(false);
      setIsPanning(false);
    }
  }, [setIsSpacePressed, setIsPanning]);

  // 鼠标进入画布事件
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    if (currentTool === 'eraser') {
      const pos = getMousePos(event, canvasRef, viewState);
      const eraseRadius = currentStrokeWidth * 3;
      setEraserPreview({ x: pos.x, y: pos.y, radius: eraseRadius });
    }
  }, [currentTool, currentStrokeWidth, canvasRef, viewState, setEraserPreview]);

  // 鼠标离开画布事件
  const handleMouseLeave = useCallback(() => {
    setEraserPreview(null);
  }, [setEraserPreview]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleKeyDown,
    handleKeyUp,
    handleMouseEnter,
    handleMouseLeave,
  };
};