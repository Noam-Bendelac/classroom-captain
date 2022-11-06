import classNames from 'classnames'
import styles from './Header.module.css'
import Back from './back.png'




export function Header({
  className,
}: {
  className: string,
}) {
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

      <button className={styles.switch}>
        <div className={styles.switchContents}>
          <div className={classNames(styles.switchIndicator, styles.captain)}></div>
          
          <div className={classNames(styles.explorerText, false && styles.switchSelected)}><p>Explorer</p></div>
          <div className={classNames(styles.captainText, true && styles.switchSelected)}><p>Captain</p></div>
        </div>
      </button>
    </div>
  </header>
}
