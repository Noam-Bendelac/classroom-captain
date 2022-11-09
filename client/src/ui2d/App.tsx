import React, { useRef, useState } from 'react';
import styles from './App.module.css';
import { UI3D } from 'ui3d/UI3D'
import { Header } from 'ui2d/Header';
import { Sidebar } from 'ui2d/Sidebar';
import { Role, ControllerProvider } from 'controller/controller';


declare global {
  interface Window {
    _setRole: any;
    _store: any;
    Vector3: any;
  }
}


function App() {
  const [role, setRole] = useState<Role>('teacher')
  
  window._setRole = setRole
  
  const canvasPanelRef = useRef<HTMLDivElement>(null)
  
  return (
    <ControllerProvider role={role}>
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
    </ControllerProvider>
  );
}

export default App;
