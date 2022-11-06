import React from 'react';
import styles from './App.module.css';
import { UI3D } from 'ui3d/UI3D'
import { Header } from 'ui2d/Header';
import { Sidebar } from 'ui2d/Sidebar';

function App() {
  return (
    <div className={styles.app}>
      <Header className={styles.header} />
      <div className={styles.mainContent}>
        <Sidebar className={styles.sidebar} />
        <div className={styles.canvasPanel}>
          <UI3D />
          {/* possibly more ui on top of canvas */}
        </div>
      </div>
    </div>
  );
}

export default App;
