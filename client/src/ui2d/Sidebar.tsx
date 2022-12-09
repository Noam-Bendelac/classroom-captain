import classNames from 'classnames'
import { ControllerContext } from 'controller/controller'
import { useContext } from 'react'
import { useStore } from 'zustand'
import styles from './Sidebar.module.css'

export function Sidebar({
  className,
}: {
  className: string,
}) {
  const store = useContext(ControllerContext)
  const setTopic = useStore(store, ({ setTopic }) => setTopic)
  
  return <ul className={classNames(styles.sidebar, className)}>
    <li className={styles.section}>
      <button className={styles.topicButton} onClick={() => setTopic('magnetism')}>The Magnetic Field</button>
      {/* <ul className={styles.subsections}>
        <li className={styles.subsection}>Subsection 1</li>
        <li className={styles.subsection}>Subsection 2</li>
        <li className={styles.subsection}>Subsection 3</li>
      </ul> */}
    </li>
    <li className={styles.section}>
      <button className={styles.topicButton} onClick={() => setTopic('multivar')}>Functions of Two Variables</button>
      {/* <ul className={styles.subsections}>
        <li className={styles.subsection}>Subsection 1</li>
        <li className={styles.subsection}>Subsection 2</li>
      </ul> */}
    </li>
  </ul>
}
