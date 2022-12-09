import React, { createContext, Dispatch, useContext, useRef, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, useHistory } from "react-router-dom"
import styles from './App.module.css';
import { UI3D } from 'ui3d/UI3D'
import { Header } from 'ui2d/Header';
import { Sidebar } from 'ui2d/Sidebar';
import { Role, ControllerProvider, ControllerContext } from 'controller/controller';
import { RightSideBar } from 'ui2d/RightSideBar';


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
    <Router>
      <Switch>
        <Route exact path="/">
          <HomePage setRole={setRole} setClassroomCode={setClassroomCode} />
        </Route>
        <Route path="/app">
          <DiagramPage classroomCode={classroomCode} />
        </Route>
        <Route>
          <div>404</div>
        </Route>
      </Switch>
    </Router>
  </roleContext.Provider>
}

// function Page404() {
//   return <div>404</div>
// }

function HomePage({
  setRole,
  setClassroomCode,
}: {
  setRole: Dispatch<Role>,
  setClassroomCode: Dispatch<string>,
}) {
  const [localClassroomCode, setLocalClassroomCode] = useState('')
  
  // useEffect(() => {
    
  // }), [localClassroomCode]
  
  const { push } = useHistory()
  const teacher = async () => {
    const resp = await fetch(`http://${process.env.REACT_APP_BACKEND_HOSTPORT}/classrooms`, {
      method: 'POST',
      credentials: 'include',
    }).then(r => r.json()) as { classroomCode: string }
    setClassroomCode(resp.classroomCode)
    setRole('teacher')
    push('/app')
  }
  const student = async () => {
    const resp = await fetch(`http://${process.env.REACT_APP_BACKEND_HOSTPORT}/classrooms/${localClassroomCode}/students`, {
      method: 'POST',
      credentials: 'include',
    })
    if (resp.ok) {
      setClassroomCode(localClassroomCode)
      setRole('student')
      push('/app')
    }
  }
  return <div>
    <p>
      <a href="#_" onClick={(e) => {
        e.preventDefault()
        teacher()
      }}>Teacher</a>
    </p>
    <p>
      <a href="#_" onClick={(e) => {
        e.preventDefault()
        student()
      }}>Student</a>
      <input type="text" name="code" id="code"
        value={localClassroomCode}
        onChange={(e) => setLocalClassroomCode(e.target.value)}
      />
    </p>
  </div>
}


function DiagramPage({
  classroomCode,
}: {
  classroomCode: string | null,
}) {
  
  const canvasPanelRef = useRef<HTMLDivElement>(null)
  
  return (
    <ControllerProvider>
      <div className={styles.app}>
        <Header className={styles.header} classroomCode={classroomCode} />
        <div className={styles.mainContent}>
          <Sidebar className={styles.sidebar} />
          <div ref={canvasPanelRef} className={styles.canvasPanel}>
            <UI3D parentRef={canvasPanelRef} />
            {/* possibly more ui on top of canvas */}
            <RightSideBar className={styles.rightSideBar} />
          </div>
        </div>
      </div>
    </ControllerProvider>
  );
}

export default App;
