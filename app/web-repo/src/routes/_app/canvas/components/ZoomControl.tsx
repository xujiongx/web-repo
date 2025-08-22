import React from 'react';
import { Button, Divider } from '@arco-design/web-react';
import {
  IconMinus,
  IconPlus,
  IconExpand,
} from '@arco-design/web-react/icon';
import { useCanvasStore } from '../../../../stores/canvasStore';
import styles from './ZoomControl.module.less';

const ZoomControl: React.FC = () => {
  const { viewState, elements, updateViewState } = useCanvasStore();

  // 缩放步长
  const ZOOM_STEP = 0.2;
  const MIN_ZOOM = 0.01;
  const MAX_ZOOM = 50;

  // 放大
  const zoomIn = () => {
    const newScale = Math.min(MAX_ZOOM, viewState.scale * (1 + ZOOM_STEP));
    updateViewState({ scale: newScale });
  };

  // 缩小
  const zoomOut = () => {
    const newScale = Math.max(MIN_ZOOM, viewState.scale * (1 - ZOOM_STEP));
    updateViewState({ scale: newScale });
  };

  // 缩放到合适大小（适应所有元素）
  const fitToScreen = () => {
    if (elements.length === 0) {
      // 如果没有元素，重置到默认视图
      updateViewState({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      });
      return;
    }

    // 计算所有元素的边界框
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(element => {
      if (element.points && element.points.length > 0) {
        // 对于有点集合的元素（线条、画笔）
        element.points.forEach(point => {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        });
      } else {
        // 对于其他元素
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.x + (element.width || 0));
        maxY = Math.max(maxY, element.y + (element.height || 0));
      }
    });

    // 添加一些边距
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // 假设画布大小（实际应该从 ref 获取）
    const canvasWidth = window.innerWidth - 200; // 减去侧边栏宽度
    const canvasHeight = window.innerHeight - 150; // 减去顶部工具栏高度

    // 计算合适的缩放比例
    const scaleX = canvasWidth / contentWidth;
    const scaleY = canvasHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1); // 不超过100%

    // 计算居中的偏移量
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const offsetX = canvasWidth / 2 - centerX * scale;
    const offsetY = canvasHeight / 2 - centerY * scale;

    updateViewState({
      scale,
      offsetX,
      offsetY,
    });
  };

  // 格式化缩放百分比
  const getZoomPercentage = () => {
    return Math.round(viewState.scale * 100);
  };

  return (
    <div className={styles.zoomControl}>
      <div className={styles.controls}>
        <Button
          size="small"
          icon={<IconMinus />}
          onClick={zoomOut}
          disabled={viewState.scale <= MIN_ZOOM}
          title="缩小"
        />
        
        <Divider type="vertical" />
        
        <div className={styles.zoomDisplay} title="当前缩放比例">
          {getZoomPercentage()}%
        </div>
        
        <Divider type="vertical" />
        
        <Button
          size="small"
          icon={<IconPlus />}
          onClick={zoomIn}
          disabled={viewState.scale >= MAX_ZOOM}
          title="放大"
        />
        
        <Divider type="vertical" />
        
        <Button
          size="small"
          icon={<IconExpand />}
          onClick={fitToScreen}
          title="缩放到合适大小"
        />
      </div>
    </div>
  );
};

export default ZoomControl;