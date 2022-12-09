import classNames from 'classnames'
import styles from './Header.module.css'
import Back from './back.png'
import { useContext } from 'react'
import { ControllerContext } from 'controller/controller'
import { useStore } from 'zustand'
import shallow from 'zustand/shallow'
import { roleContext } from 'ui2d/App'



export function Header({
  className,
  classroomCode,
}: {
  className: string,
  classroomCode: string | null,
}) {
  const role = useContext(roleContext)
  
  const store = useContext(ControllerContext)
  const { mode, setMode, topic } = useStore(store,
    ({ mode, setMode, topic }) => ({ mode, setMode, topic }),
    shallow
  )
  
  
  return <header className={classNames(styles.header, className)}>
    <div className={styles.left}>
      <img src={Back} alt="back" className={styles.back} /> 
      <div className={styles.topicContainer}>
        <p className={styles.subject}>
          { topic === 'magnetism'
          ? 'Physics / Electricity and Magnetism'
          : 'Mathematics / Multivariable Calculus'
          }
        </p>
        <h1 className={styles.topic}>
          { topic === 'magnetism'
          ? 'The Magnetic Field'
          : 'Functions of Two Variables'
          }
        </h1>
      </div>
    </div>
    <div className={styles.right}>
      { role === 'teacher'
      ? <div className={styles.classCodeContainer}>
          <p className={styles.classCodeLabel}>Class Code</p>
          <h2 className={styles.classCode}>{classroomCode}</h2>
        </div>
      : role === 'student' &&
        <div className={styles.classCodeContainer}>
          <p className={styles.classCodeLabel}>Class Code</p>
          <h2 className={styles.classCodeStudent}>{classroomCode}</h2>
        </div>
      }

      { role === 'teacher' &&
        <div className={styles.studentsContainer}>
          <p className={styles.students}>23</p>
          <p className={styles.studentsLabel}>Explorers</p>
        </div>
      }

      { role === 'teacher'
      ? <button className={styles.switch} onClick={() => setMode(mode === 'captain' ? 'explorer' : 'captain')}>
          <div className={styles.switchContents}>
            <div className={classNames(styles.switchIndicator, mode === 'captain' ? styles.captain : styles.explorer)}></div>
            
            <div className={classNames(styles.explorerText, mode === 'explorer' && styles.switchSelected)}><p>Explorer</p></div>
            <div className={classNames(styles.captainText, mode === 'captain' && styles.switchSelected)}><p>Captain</p></div>
          </div>
        </button>
      : role === 'student' &&
        <button className={styles.switch} style={{ width: 'unset' }} disabled>
          <div className={styles.switchContents}>
            {/* <div className={classNames(styles.switchIndicator, mode === 'captain' ? styles.captain : styles.explorer)}></div> */}
            
            <div className={classNames(styles.studentMode)}><p>
              { mode === 'explorer' ? 'Explorer' : 'Captain'}
            </p></div>
          </div>
        </button>
      }
      
    </div>
  </header>
}
