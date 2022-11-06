import React, { useRef } from 'react';
import styles from './App.module.css';
import { UI3D } from 'ui3d/UI3D'
import { Header } from 'ui2d/Header';
import { Sidebar } from 'ui2d/Sidebar';

function App() {
  const canvasPanelRef = useRef<HTMLDivElement>(null)
  
  return (
    <div className={styles.app}>
      <Header className={styles.header} />
      <div className={styles.mainContent}>
        <Sidebar className={styles.sidebar} />
        <div ref={canvasPanelRef} className={styles.canvasPanel}>
          <UI3D parentRef={canvasPanelRef} />
          {/* possibly more ui on top of canvas */}
        </div>
      </div>
    </div>
  );
}

export default App;
