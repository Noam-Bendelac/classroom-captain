import { ControllerContext } from 'controller/controller'
import { HTMLAttributes, PropsWithChildren, useContext, useDebugValue, useEffect, useRef } from 'react'
import { useStore } from 'zustand'
import { MathfieldElement, MathfieldElementAttributes } from 'mathlive'
import { CE } from 'ui3d/MultivarScene';
import classNames from 'classnames';
import styles from './RightSideBar.module.css';
import { roleContext } from 'ui2d/App';




declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['math-field']: PropsWithChildren<Partial<
        MathfieldElementAttributes &
        HTMLAttributes<HTMLElement> & {
          // onChange?: () => void,
          // onInput?: () => void,
          ref?: React.Ref<MathfieldElement>,
          key?: React.Key,
        }
      >>;
    }
  }
}


export function RightSideBar({
  className,
}: {
  className: string,
}) {
  
  
  return <div className={classNames(styles.rightSideBar, className)}>
    <FunctionBox />
    <SlidersBox />
    
  </div>
}


function FunctionBox() {
  const store = useContext(ControllerContext)
  const setFunc = useStore(store, (store) => store.topic === 'multivar' ? store.setFunc : null)
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? store.func : null,
    func => {
      if (func === null) return;
      // TODO if student and captain mode
    }
  ), [store])
  
  const mathField = useRef<MathfieldElement>(null)
  
  console.log('rerender')
  
  // due to weirdness in mathlive's typescript/npm package setup, we must reference
  // the *class* not just the *type* in our code for the library to work
  useDebugValue(MathfieldElement)
  
  useEffect(() => {
    // setTimeout(() => {
    const field = mathField.current
    console.log(field)
    const handler = () => {
      const val = field?.value
      const expr = CE.parse(val!)
      console.log(expr);
      // console.log(expr.N().valueOf());
      // console.log({json})
      setFunc?.(expr)
    }
    handler()
    field?.addEventListener('input', handler)
    // }, 1000)
    
    return () => field?.removeEventListener('input', handler)
  }, [mathField, setFunc])
  
  return <div className={styles.box}>
    <div className={styles.boxHeadings}>
      <h3 className={styles.boxHeading}>Function</h3>
    </div>
    <div className={styles.functionRow}>
      <math-field read-only class={styles.math}>{"f(x,y)="}</math-field>
      {/* <div className={styles.inputMath}> */}
        <math-field
          ref={mathField}
          class={classNames(styles.math, styles.inputMath)}
          virtual-keyboard-mode={'off'}
          >
          {"0.1(x^2+y^2)"}
        </math-field>
      {/* </div> */}
    </div>
    <p>Type a function or
      <button
        className={styles.functionButton}
      >try another one</button>
    </p>
  </div>
}


function SlidersBox() {
  
  const xRef = useRef<HTMLInputElement>(null)
  const yRef = useRef<HTMLInputElement>(null)
  
  const store = useContext(ControllerContext)
  const role = useContext(roleContext)
  const mode = useStore(store, ({ mode }) => mode)
  const setX = useStore(store, (store) => store.topic === 'multivar' ? store.setX : null)
  const setY = useStore(store, (store) => store.topic === 'multivar' ? store.setY : null)
  
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? store.x : null,
    x => {
      if (x === null) return;
      if (xRef.current) {
        xRef.current.valueAsNumber = x
      }
    }
  ), [store])
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? store.y : null,
    y => {
      if (y === null) return;
      if (yRef.current) {
        yRef.current.valueAsNumber = y
      }
    }
  ), [store])
  
  return <div className={styles.box}>
    <div className={styles.boxHeadings}>
      <h3 className={styles.boxHeading}>Traces</h3>
      <p className={styles.boxSubheading}>(cross section curves)</p>
    </div>
    <div className={styles.sliderItem}>
      <div className={styles.sliderRow}>
        <math-field read-only class={styles.math}>{'x_1=0'}</math-field>
        <input
          ref={xRef}
          className={styles.slider}
          type={'range'} defaultValue={0} min={-5} max={5} step={0.1}
          disabled={role === 'student' && mode === 'captain'}
          onChange={(e) => {
            setX?.(e.target.valueAsNumber)
          }}
        />
      </div>
    </div>
    <div className={styles.sliderItem}>
      <div className={styles.sliderRow}>
        <math-field read-only class={styles.math}>{'y_1=0'}</math-field>
        <input
          ref={yRef}
          className={styles.slider}
          type={'range'} defaultValue={0} min={-5} max={5} step={0.1}
          disabled={role === 'student' && mode === 'captain'}
          onChange={(e) => {
            setY?.(e.target.valueAsNumber)
          }}
        />
      </div>
    </div>
  </div>
}
