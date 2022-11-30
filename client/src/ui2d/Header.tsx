import classNames from 'classnames'
import styles from './Header.module.css'
import Back from './back.png'
import { useContext } from 'react'
import { ControllerContext } from 'controller/controller'
import { useStore } from 'zustand'
import shallow from 'zustand/shallow'



export function Header({
  className,
}: {
  className: string,
}) {
  const store = useContext(ControllerContext)
  const { mode, setMode } = useStore(store,
    ({ mode, setMode }) => ({ mode, setMode }),
    shallow
  )
  
  
  return <header className={classNames(styles.header, className)}>
    <div className={styles.left}>
      <img src={Back} alt="back" className={styles.back} /> 
      <div className={styles.topicContainer}>
        <p className={styles.subject}> Physics / Electricity and Magnetism</p>
        <h1 className={styles.topic}>Ch 29. The Magnetic Field</h1>
      </div>
    </div>
    <div className={styles.right}>
        <div className={styles.classCodeContainer}>
          <p className={styles.classCodeLabel}>Class Code</p>
          <h2 className={styles.classCode}>ABC123</h2>
        </div>

        <div className={styles.studentsContainer}>
          <p className={styles.students}>23</p>
          <p className={styles.studentsLabel}>Explorers</p>
        </div>

      <button className={styles.switch} onClick={() => setMode(mode === 'captain' ? 'explorer' : 'captain')}>
        <div className={styles.switchContents}>
          <div className={classNames(styles.switchIndicator, mode === 'captain' ? styles.captain : styles.explorer)}></div>
          
          <div className={classNames(styles.explorerText, mode === 'explorer' && styles.switchSelected)}><p>Explorer</p></div>
          <div className={classNames(styles.captainText, mode === 'captain' && styles.switchSelected)}><p>Captain</p></div>
        </div>
      </button>
    </div>
  </header>
}
