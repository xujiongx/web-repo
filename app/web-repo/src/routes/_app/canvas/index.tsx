import { createFileRoute } from '@tanstack/react-router';
import React, { useRef } from 'react';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import ZoomControl from './components/ZoomControl';
import MiniMap from './components/MiniMap';
import styles from './index.module.less';

const CanvasPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className={styles.canvasPage}>
      <div className={styles.toolbar}>
        <Toolbar canvasRef={canvasRef} />
      </div>
      <div className={styles.canvasContainer}>
        <Canvas ref={canvasRef} />
        <ZoomControl />
        <MiniMap />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_app/canvas/')({
  component: CanvasPage,
});