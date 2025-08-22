import { DrawingElement } from '../../../../stores/canvasStore';

export class ElementRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // 绘制单个元素
  drawElement = (element: DrawingElement) => {
    this.ctx.save();
    this.ctx.strokeStyle = element.color;
    this.ctx.lineWidth = element.strokeWidth;
    this.ctx.fillStyle = element.fill || 'transparent';

    switch (element.type) {
      case 'pen':
        this.drawPen(element);
        break;
      case 'line':
        this.drawLine(element);
        break;
      case 'rectangle':
        this.drawRectangle(element);
        break;
      case 'circle':
        this.drawCircle(element);
        break;
      case 'text':
        this.drawText(element);
        break;
      case 'image':
        this.drawImage(element);
        break;
      case 'video':
        this.drawVideo(element);
        break;
    }

    this.ctx.restore();
  };

  private drawPen = (element: DrawingElement) => {
    if (element.points && element.points.length > 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(element.points[0].x, element.points[0].y);
      for (let i = 1; i < element.points.length; i++) {
        this.ctx.lineTo(element.points[i].x, element.points[i].y);
      }
      this.ctx.stroke();
    }
  };

  private drawLine = (element: DrawingElement) => {
    if (element.points && element.points.length >= 2) {
      const start = element.points[0];
      const end = element.points[element.points.length - 1];
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    }
  };

  private drawRectangle = (element: DrawingElement) => {
    if (element.width && element.height) {
      this.ctx.beginPath();
      this.ctx.rect(element.x, element.y, element.width, element.height);
      if (element.fill && element.fill !== 'transparent') {
        this.ctx.fill();
      }
      this.ctx.stroke();
    }
  };

  private drawCircle = (element: DrawingElement) => {
    if (element.width && element.height) {
      const radiusX = Math.abs(element.width) / 2;
      const radiusY = Math.abs(element.height) / 2;
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      if (element.fill && element.fill !== 'transparent') {
        this.ctx.fill();
      }
      this.ctx.stroke();
    }
  };

  private drawText = (element: DrawingElement) => {
    if (element.text) {
      this.ctx.font = `${element.strokeWidth * 8}px Arial`;
      this.ctx.fillStyle = element.color;
      this.ctx.fillText(element.text, element.x, element.y);
    }
  };

  private drawImage = (element: DrawingElement) => {
    if (element.src && element.width && element.height) {
      const img = new Image();
      img.src = element.src;
      if (img.complete && img.naturalWidth > 0) {
        this.ctx.drawImage(img, element.x, element.y, element.width, element.height);
      } else {
        this.drawImagePlaceholder(element);
      }
    }
  };

  private drawImagePlaceholder = (element: DrawingElement) => {
    if (!element.width || !element.height) return;
    
    // 图片未加载完成，绘制占位符
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(element.x, element.y, element.width, element.height);
    this.ctx.strokeStyle = '#ccc';
    this.ctx.strokeRect(element.x, element.y, element.width, element.height);
    
    // 绘制加载中文字
    this.ctx.fillStyle = '#666';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('加载中...', element.x + element.width / 2, element.y + element.height / 2);
    this.ctx.textAlign = 'left';
  };

  private drawVideo = (element: DrawingElement) => {
    if (element.src && element.width && element.height) {
      // 获取或创建 video 元素
      const videoId = `video-${element.id}`;
      let video = document.getElementById(videoId) as HTMLVideoElement;
      
      if (!video) {
        video = document.createElement('video');
        video.id = videoId;
        video.src = element.src;
        video.style.display = 'none';
        video.muted = true;
        video.loop = true;
        document.body.appendChild(video);
      }
      
      if (video.readyState >= 2) {
        // 视频已加载，绘制当前帧
        this.ctx.drawImage(video, element.x, element.y, element.width, element.height);
        
        // 如果没有播放，绘制播放按钮
        if (!element.isPlaying) {
          this.drawPlayButton(element);
        }
      } else {
        this.drawVideoPlaceholder(element);
      }
    }
  };

  private drawPlayButton = (element: DrawingElement) => {
    if (!element.width || !element.height) return;
    
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const playIconSize = Math.min(element.width, element.height) * 0.1;
    
    // 绘制播放按钮背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, playIconSize * 1.5, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // 绘制播放三角形
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - playIconSize / 2, centerY - playIconSize / 2);
    this.ctx.lineTo(centerX + playIconSize / 2, centerY);
    this.ctx.lineTo(centerX - playIconSize / 2, centerY + playIconSize / 2);
    this.ctx.closePath();
    this.ctx.fill();
  };

  private drawVideoPlaceholder = (element: DrawingElement) => {
    if (!element.width || !element.height) return;
    
    // 视频未加载完成，绘制占位符
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(element.x, element.y, element.width, element.height);
    this.ctx.strokeStyle = '#ccc';
    this.ctx.strokeRect(element.x, element.y, element.width, element.height);
    
    // 绘制加载中文字
    this.ctx.fillStyle = '#666';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('视频加载中...', element.x + element.width / 2, element.y + element.height / 2);
    this.ctx.textAlign = 'left';
    
    // 绘制视频图标
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2 - 20;
    const iconSize = 16;
    
    this.ctx.fillStyle = '#999';
    this.ctx.fillRect(centerX - iconSize / 2, centerY - iconSize / 2, iconSize, iconSize * 0.7);
  };

  // 绘制选中状态
  drawSelection = (element: DrawingElement, scale: number, getElementBounds: (element: DrawingElement) => any) => {
    this.ctx.save();
    this.ctx.strokeStyle = '#1890ff';
    this.ctx.lineWidth = 2 / scale;
    this.ctx.setLineDash([5 / scale, 5 / scale]);

    const bounds = getElementBounds(element);
    if (bounds) {
      this.ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
    }

    this.ctx.restore();
  };

  // 绘制橡皮擦预览
  drawEraserPreview = (preview: { x: number; y: number; radius: number }, scale: number) => {
    this.ctx.save();
    this.ctx.strokeStyle = '#ff4d4f';
    this.ctx.lineWidth = 2 / scale;
    this.ctx.setLineDash([5 / scale, 5 / scale]);
    this.ctx.globalAlpha = 0.7;
    
    this.ctx.beginPath();
    this.ctx.arc(preview.x, preview.y, preview.radius, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    this.ctx.globalAlpha = 0.2;
    this.ctx.fillStyle = '#ff4d4f';
    this.ctx.fill();
    
    this.ctx.restore();
  };

  // 绘制网格
  drawGrid = (canvasRef: React.RefObject<HTMLCanvasElement>, viewState: any) => {
    const gridSize = 20;
    const canvas = canvasRef.current;
    if (!canvas) return;

    this.ctx.save();
    this.ctx.strokeStyle = '#f0f0f0';
    this.ctx.lineWidth = 0.5;

    const startX = Math.floor(-viewState.offsetX / viewState.scale / gridSize) * gridSize;
    const startY = Math.floor(-viewState.offsetY / viewState.scale / gridSize) * gridSize;
    const endX = startX + (canvas.width / viewState.scale) + gridSize;
    const endY = startY + (canvas.height / viewState.scale) + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
      this.ctx.stroke();
    }

    for (let y = startY; y < endY; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  };
}