import React from 'react';
import Back from './back.png';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <ul>
        <img src={Back} alt="back" /> 
            <li className={styles.topic}>
              <li style={{ fontSize: 15}}> Physics / Electricity and Magnetism</li>
              Ch 29. The Magnetic Field
              </li>

          <ul className={styles.classinfo}>
            <li className={styles.classId}>
              <li style={{ fontSize: 20 }}>Class Code</li>
              ABC123
              </li>

            <li className={styles.students}>
              <li style={{ fontSize: 40 }}>23</li>
              Explorer
              </li>
          </ul>

          <li>
            <label className={styles.switch}>
              <input type="checkbox"></input>
              <span className={styles.slider}>
              </span>
            </label>
          </li>

        </ul>
      </header>
      <div className={styles.sidebar}>
          <ul>
            <li>Chapter 1
                <li> Section 1</li>
                <li> Section 2</li>
                <li> Section 3</li>
            </li>
            <li>Chapter 2
            <li> Section 1</li>
                <li> Section 2</li>
            </li>
          </ul>
      </div>
    </div>
  );
}

export default App;
