import React, { createContext, useContext, useRef, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import styles from './App.module.css';
import { UI3D } from 'ui3d/UI3D'
import { Header } from 'ui2d/Header';
import { Sidebar } from 'ui2d/Sidebar';
import { Role, ControllerProvider, ControllerContext } from 'controller/controller';
import { RightSideBar } from 'ui2d/RightSideBar';
import { useStore } from 'zustand';
import { ApiDemoPage } from 'ui2d/ApiDemoPage';
import { MultiplayerDemoPage } from 'ui2d/MultiplayerDemoPage';
import { LandingPage } from 'ui2d/LandingPage';


declare global {
  interface Window {
    _setRole: any;
    _store: any;
    Vector3: any;
  }
}


export const roleContext = createContext<Role>('neither')


function App() {
  const [role, setRole] = useState<Role>('neither')
  const [classroomCode, setClassroomCode] = useState<string | null>(null)
  
  window._setRole = setRole
  
  return <roleContext.Provider value={role}>
    { process.env.REACT_APP_BACKEND_HOST
    ? <Router>
        <Switch>
          <Route exact path="/">
            <LandingPage setRole={setRole} setClassroomCode={setClassroomCode} />
          </Route>
          <Route path="/api">
            <ApiDemoPage />
          </Route>
          <Route path="/demo">
            <MultiplayerDemoPage />
          </Route>
          <Route path="/app">
            <DiagramPage classroomCode={classroomCode} />
          </Route>
          <Route>
            <div>404</div>
          </Route>
        </Switch>
      </Router>
    : <DiagramPage classroomCode={classroomCode} />
    }
    
  </roleContext.Provider>
}

// function Page404() {
//   return <div>404</div>
// }




function DiagramPage({
  classroomCode,
}: {
  classroomCode: string | null,
}) {
  
  
  return (
    <ControllerProvider>
      <DiagramPageContents classroomCode={classroomCode} />
    </ControllerProvider>
  );
}

function DiagramPageContents({
  classroomCode,
}: {
  classroomCode: string | null,
}) {
  const store = useContext(ControllerContext)
  const topic = useStore(store, ({ topic }) => topic)
  
  const canvasPanelRef = useRef<HTMLDivElement>(null)
  
  return <div className={styles.app}>
    <Header className={styles.header} classroomCode={classroomCode} />
    <div className={styles.mainContent}>
      <Sidebar className={styles.sidebar} />
      <div ref={canvasPanelRef} className={styles.canvasPanel}>
        <UI3D parentRef={canvasPanelRef} />
        {/* possibly more ui on top of canvas */}
        { topic === 'multivar' && <RightSideBar className={styles.rightSideBar} /> }
      </div>
    </div>
  </div>
}

export default App;
