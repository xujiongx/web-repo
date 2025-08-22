import React, { useRef } from 'react';
import { Button, Divider, InputNumber, Tooltip, Message } from '@arco-design/web-react';
import {
  IconEdit,
  IconMinus,
  IconStop,
  IconRecord,
  IconFontColors,
  IconEraser,
  IconSelectAll,
  IconUndo,
  IconRedo,
  IconDelete,
  IconRefresh,
  IconImage,
  IconVideoCamera,
  IconDownload,
} from '@arco-design/web-react/icon';
import { useCanvasStore, DrawingTool } from '../../../../stores/canvasStore';
import styles from './Toolbar.module.less';

const Toolbar: React.FC<{ canvasRef?: React.RefObject<HTMLCanvasElement | null> }> = ({ canvasRef }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const {
    currentTool,
    currentColor,
    currentStrokeWidth,
    currentFill,
    selectedElementIds,
    historyIndex,
    history,
    setTool,
    setColor,
    setStrokeWidth,
    setFill,
    deleteSelectedElements,
    clearCanvas,
    undo,
    redo,
    importImage,
    importVideo,
    exportAsImage,
  } = useCanvasStore();

  const tools: Array<{
    key: DrawingTool;
    icon: React.ComponentType;
    tooltip: string;
  }> = [
    { key: 'select', icon: IconSelectAll, tooltip: '选择工具' },
    { key: 'pen', icon: IconEdit, tooltip: '画笔' },
    { key: 'line', icon: IconMinus, tooltip: '直线' },
    { key: 'rectangle', icon: IconStop, tooltip: '矩形' },
    { key: 'circle', icon: IconRecord, tooltip: '圆形' },
    { key: 'text', icon: IconFontColors, tooltip: '文字' },
    { key: 'eraser', icon: IconEraser, tooltip: '橡皮擦' },
  ];

  const handleToolChange = (tool: DrawingTool) => {
    setTool(tool);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const handleFillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFill(e.target.value);
  };

  const handleStrokeWidthChange = (value: number | undefined) => {
    if (value !== undefined && value > 0) {
      setStrokeWidth(value);
    }
  };

  // 处理图片导入
  const handleImageImport = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // 在画布中心位置添加图片
        await importImage(file, 400, 300);
        Message.success('图片导入成功');
      } catch (error) {
        Message.error('图片导入失败');
      }
    } else {
      Message.error('请选择有效的图片文件');
    }
    // 清空输入
    if (event.target) {
      event.target.value = '';
    }
  };

  // 处理视频导入
  const handleVideoImport = () => {
    videoInputRef.current?.click();
  };

  const handleVideoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      try {
        // 在画布中心位置添加视频
        await importVideo(file, 400, 300);
        Message.success('视频导入成功');
      } catch (error) {
        Message.error('视频导入失败');
      }
    } else {
      Message.error('请选择有效的视频文件');
    }
    // 清空输入
    if (event.target) {
      event.target.value = '';
    }
  };

  // 处理导出图片
  const handleExportImage = () => {
    if (canvasRef?.current) {
      exportAsImage(canvasRef.current);
      Message.success('正在导出图片...');
    } else {
      Message.error('画布未初始化');
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasSelection = selectedElementIds.length > 0;

  return (
    <div className={styles.toolbar}>
      {/* 工具选择 */}
      <div className={styles.toolGroup}>
        {tools.map(({ key, icon: Icon, tooltip }) => (
          <Tooltip key={key} content={tooltip}>
            <Button
              type={currentTool === key ? 'primary' : 'outline'}
              size="small"
              icon={<Icon />}
              onClick={() => handleToolChange(key)}
              className={styles.toolButton}
            />
          </Tooltip>
        ))}
      </div>

      <Divider type="vertical" />

      {/* 样式控制 */}
      <div className={styles.styleGroup}>
        <Tooltip content="线条颜色">
          <div className={styles.colorInput}>
            <label htmlFor="stroke-color">线条:</label>
            <input
              id="stroke-color"
              type="color"
              value={currentColor}
              onChange={handleColorChange}
              className={styles.colorPicker}
            />
          </div>
        </Tooltip>

        <Tooltip content="填充颜色">
          <div className={styles.colorInput}>
            <label htmlFor="fill-color">填充:</label>
            <input
              id="fill-color"
              type="color"
              value={currentFill === 'transparent' ? '#ffffff' : currentFill}
              onChange={handleFillChange}
              className={styles.colorPicker}
            />
          </div>
        </Tooltip>

        <Tooltip content="线条粗细">
          <div className={styles.numberInput}>
            <label>粗细:</label>
            <InputNumber
              size="small"
              min={1}
              max={20}
              value={currentStrokeWidth}
              onChange={handleStrokeWidthChange}
              style={{ width: 60 }}
            />
          </div>
        </Tooltip>
      </div>

      <Divider type="vertical" />

      {/* 操作按钮 */}
      <div className={styles.actionGroup}>
        <Tooltip content="导入图片">
          <Button
            size="small"
            icon={<IconImage />}
            onClick={handleImageImport}
            className={styles.actionButton}
          />
        </Tooltip>

        <Tooltip content="导入视频">
          <Button
            size="small"
            icon={<IconVideoCamera />}
            onClick={handleVideoImport}
            className={styles.actionButton}
          />
        </Tooltip>

        <Tooltip content="导出图片">
          <Button
            size="small"
            icon={<IconDownload />}
            onClick={handleExportImage}
            className={styles.actionButton}
          />
        </Tooltip>

        <Divider type="vertical" />

        <Tooltip content="撤销">
          <Button
            size="small"
            icon={<IconUndo />}
            disabled={!canUndo}
            onClick={undo}
            className={styles.actionButton}
          />
        </Tooltip>

        <Tooltip content="重做">
          <Button
            size="small"
            icon={<IconRedo />}
            disabled={!canRedo}
            onClick={redo}
            className={styles.actionButton}
          />
        </Tooltip>

        <Tooltip content="删除选中">
          <Button
            size="small"
            icon={<IconDelete />}
            disabled={!hasSelection}
            onClick={deleteSelectedElements}
            className={styles.actionButton}
          />
        </Tooltip>

        <Tooltip content="清空画布">
          <Button
            size="small"
            icon={<IconRefresh />}
            onClick={clearCanvas}
            className={styles.actionButton}
          />
        </Tooltip>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageFileChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleVideoFileChange}
      />
    </div>
  );
};

export default Toolbar;