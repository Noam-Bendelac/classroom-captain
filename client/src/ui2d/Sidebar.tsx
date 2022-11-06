import classNames from 'classnames'
import styles from './Sidebar.module.css'

export function Sidebar({
  className,
}: {
  className: string,
}) {
  return <ul className={classNames(styles.sidebar, className)}>
    <li className={styles.section}>Section 1
      <ul className={styles.subsections}>
        <li className={styles.subsection}>Subsection 1</li>
        <li className={styles.subsection}>Subsection 2</li>
        <li className={styles.subsection}>Subsection 3</li>
      </ul>
    </li>
    <li className={styles.section}>Section 2
      <ul className={styles.subsections}>
        <li className={styles.subsection}>Subsection 1</li>
        <li className={styles.subsection}>Subsection 2</li>
      </ul>
    </li>
  </ul>
}
