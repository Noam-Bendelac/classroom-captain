
import styles from './MultiplayerDemoPage.module.css'



export function MultiplayerDemoPage() {
  return <div className={styles.page}>
    <header className={styles.header}>
      <p>Classroom Captain is a multi-user app for teachers to guide students’ learning of 3D STEM topics. This demo allows you to use the app from both types of users’ perspectives. In the teacher’s view below, start hosting a classroom. Then type the classroom code in the student’s view for the student to join the classroom.</p>
      <p>Experiment with the diagrams in Captain Mode and Explorer Mode! Captain Mode lets teachers control students’ diagrams to guide their attention during an explanation, and Explorer Mode lets students control their own diagrams independently to build intuition and familiarity.</p>
      <p>(<a href='/'>Use the app as a single user here</a>)</p>
    </header>
    <main className={styles.main}>
      <section className={styles.userView}>
        <h2>Teacher’s view</h2>
        <div className={styles.app}>
          <iframe
            src='/'
            title={'Teacher\'s view'}
          />
        </div>
      </section>
      <section className={styles.userView}>
        <h2>Student’s view</h2>
        <div className={styles.app}>
          <iframe
            src='/'
            title={'Student\'s view'}
          />
        </div>
      </section>
    </main>
  </div>
}


