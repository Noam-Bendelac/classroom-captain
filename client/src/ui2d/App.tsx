import React, { Dispatch, PropsWithChildren, useDebugValue, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, useHistory } from "react-router-dom"
import styles from './App.module.css';
import { CE, UI3D } from 'ui3d/UI3D'
import { Header } from 'ui2d/Header';
import { Sidebar } from 'ui2d/Sidebar';
import { Role, ControllerProvider } from 'controller/controller';
import { MathfieldElement, MathfieldElementAttributes } from 'mathlive'
import { BoxedExpression, ComputeEngine } from '@cortex-js/compute-engine'

// const CE = new ComputeEngine()

declare global {
  interface Window {
    _setRole: any;
    _store: any;
    Vector3: any;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['math-field']: PropsWithChildren<Partial<MathfieldElementAttributes> & {
        // onChange?: () => void,
        // onInput?: () => void,
        ref?: React.Ref<MathfieldElement>,
        key?: React.Key,
      }>;
    }
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
  
  const [math, setMath] = useState<BoxedExpression>(CE.parse('f(x,y)=0.1(x^2+y^2)'))
  const mathField = useRef<MathfieldElement>(null)
  
  console.log('rerender')
  
  // due to weirdness in mathlive's typescript/npm package setup, we must reference
  // the *class* not just the *type* in our code for the library to work
  useDebugValue(MathfieldElement)
  
  useEffect(() => {
    // setTimeout(() => {
      const field = mathField.current
      console.log(field)
      // field?.setValue('f(x,y)=x+y')
      const handler = () => {
        const val = field?.value
        const expr = CE.parse(val!)
        console.log(expr);
        // console.log(expr.N().valueOf());
        // console.log({json})
        setMath(expr)
      }
      handler()
      field?.addEventListener('input', handler)
    // }, 1000)
    
    // return field?.removeEventListener('input', handler)
  }, [mathField])
  
  return (
    <ControllerProvider role={role}>
      <div className={styles.app}>
        <Header className={styles.header} classroomCode={classroomCode} />
        <div className={styles.mainContent}>
          <Sidebar className={styles.sidebar} />
          <div ref={canvasPanelRef} className={styles.canvasPanel}>
            <UI3D parentRef={canvasPanelRef} func={math} />
            {/* possibly more ui on top of canvas */}
            <div className={styles.canvasBox}>
              <math-field ref={mathField}
                virtual-keyboard-mode={'off'}
                // read-only
              >
                {/* {"f(x,y)=\\placeholder[rhs]{0.1*(x^2+y^2)}"} */}
                {"f(x,y)=0.1(x^2+y^2)"}
              </math-field>
            </div>
          </div>
        </div>
      </div>
    </ControllerProvider>
  );
}

export default App;
