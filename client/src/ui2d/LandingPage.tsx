import { Role } from 'controller/controller'
import { Dispatch, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import styles from './LandingPage.module.css'


export function LandingPage({
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
    const resp = await fetch(`http${process.env.REACT_APP_SECURE === 'true' ? 's' : ''}://${process.env.REACT_APP_BACKEND_HOST}/classrooms`, {
      method: 'POST',
      credentials: 'include',
    }).then(r => r.json()) as { classroomCode: string }
    setClassroomCode(resp.classroomCode)
    setRole('teacher')
    push('/app')
  }
  const student = async () => {
    const resp = await fetch(`http${process.env.REACT_APP_SECURE === 'true' ? 's' : ''}://${process.env.REACT_APP_BACKEND_HOST}/classrooms/${localClassroomCode}/students`, {
      method: 'POST',
      credentials: 'include',
    })
    if (resp.ok) {
      setClassroomCode(localClassroomCode)
      setRole('student')
      push('/app')
    }
  }
  return <div className={styles.page}>
    <main>
      <a className={styles.teacher} href="/app" onClick={(e) => {
        e.preventDefault()
        teacher()
      }}>Teachers: Start hosting a classroom</a>
      <form className={styles.student} onSubmit={(e) => {
        e.preventDefault()
        student()
      }}>
        Students: Enter the classroom code on your teacher's screen
        <input type="text" name="code" id="code"
          value={localClassroomCode}
          onChange={(e) => setLocalClassroomCode(e.target.value)}
        />
        <button type='submit'>Join</button>
      </form>
      
      <Link className={styles.demo} to={'/demo'}>Try a demo of the app's multi-user interaction on one screen</Link>
    </main>
  </div>
}

