import React, { Dispatch, useRef, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, useHistory } from "react-router-dom"
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
  const [role, setRole] = useState<Role>('neither')
  const [classroomCode, setClassroomCode] = useState<string | null>(null)
  
  window._setRole = setRole
  
  return <Router>
    <Switch>
      <Route exact path="/">
        <HomePage setRole={setRole} setClassroomCode={setClassroomCode} />
      </Route>
      <Route path="/app">
        <DiagramPage role={role} classroomCode={classroomCode} />
      </Route>
      <Route>
        <div>404</div>
      </Route>
    </Switch>
  </Router>
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
  role,
  classroomCode,
}: {
  role: Role,
  classroomCode: string | null,
}) {
  
  const canvasPanelRef = useRef<HTMLDivElement>(null)
  
  return (
    <ControllerProvider role={role}>
      <div className={styles.app}>
        <Header className={styles.header} classroomCode={classroomCode} />
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
