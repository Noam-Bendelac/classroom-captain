import { ControllerContext } from 'controller/controller'
import { HTMLAttributes, PropsWithChildren, useContext, useDebugValue, useEffect, useRef, useState } from 'react'
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


const functions = [
  '0.2(x^2+y^2)',
  '\\cos(x)\\cos(y)',
  '-0.2(x^2+y^2)',
  'x',
  '\\cos(x)\\sin(y)',
  '0.2y^2',
]



function FunctionBox() {
  const [funcIndex, setFuncIndex] = useState(0)
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
      // console.log(expr);
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
          {functions[0]}
        </math-field>
      {/* </div> */}
    </div>
    <p>Type a function or{' '}
      <button
        onClick={() => {
          const newLatex = functions[(funcIndex + 1) % functions.length]
          setFunc?.(CE.parse(newLatex))
          setFuncIndex(i => i + 1)
          // TODO is this right
          if (mathField.current) {
            mathField.current.value = newLatex
          }
        }}
        className={styles.functionButton}
      >try another one</button>
    </p>
  </div>
}


function SlidersBox() {
  
  const xSliderRef = useRef<HTMLInputElement>(null)
  const ySliderRef = useRef<HTMLInputElement>(null)
  const xMathRef = useRef<MathfieldElement>(null)
  const yMathRef = useRef<MathfieldElement>(null)
  const xFunctionRef = useRef<MathfieldElement>(null)
  const yFunctionRef = useRef<MathfieldElement>(null)
  
  const store = useContext(ControllerContext)
  const role = useContext(roleContext)
  const mode = useStore(store, ({ mode }) => mode)
  const setX = useStore(store, (store) => store.topic === 'multivar' ? store.setX : null)
  const setY = useStore(store, (store) => store.topic === 'multivar' ? store.setY : null)
  
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? store.x : null,
    x => {
      if (x === null) return;
      if (xSliderRef.current) {
        xSliderRef.current.valueAsNumber = x
      }
      if (xMathRef.current) {
        xMathRef.current.value = `x_1=${x}`
      }
    }
  ), [store])
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? store.y : null,
    y => {
      if (y === null) return;
      if (ySliderRef.current) {
        ySliderRef.current.valueAsNumber = y
      }
      if (yMathRef.current) {
        yMathRef.current.value = `y_1=${y}`
      }
    }
  ), [store])
  
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? [store.x, store.func] as const : null,
    (state) => {
      if (state === null) return;
      const [x, func] = state
      if (xFunctionRef.current) {
        CE.set({ x, y: null })
        CE.latexOptions.precision = 3
        CE.latexOptions.truncationMarker = ''
        const expr = func.evaluate()
        xFunctionRef.current.expression = CE.box(['Equal', ['f', CE.parse('x_1'), 'y'], expr])
      }
    }
  ), [store])
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? [store.y, store.func] as const : null,
    (state) => {
      if (state === null) return;
      const [y, func] = state
      if (yFunctionRef.current) {
        CE.set({ x: null, y })
        CE.latexOptions.precision = 3
        CE.latexOptions.truncationMarker = ''
        const expr = func.evaluate()
        yFunctionRef.current.expression = CE.box(['Equal', ['f', 'x', CE.parse('y_1')], expr])
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
        <math-field ref={xMathRef} read-only class={classNames(styles.math, styles.sliderLabel)}>{'x_1=0'}</math-field>
        <input
          ref={xSliderRef}
          className={styles.slider}
          type={'range'} defaultValue={0} min={-5} max={5} step={0.1}
          disabled={role === 'student' && mode === 'captain'}
          onChange={(e) => {
            setX?.(e.target.valueAsNumber)
          }}
        />
      </div>
      <math-field class={styles.math} ref={xFunctionRef} read-only></math-field>
    </div>
    <div className={styles.sliderItem}>
      <div className={styles.sliderRow}>
        <math-field ref={yMathRef} read-only class={classNames(styles.math, styles.sliderLabel)}>{'y_1=0'}</math-field>
        <input
          ref={ySliderRef}
          className={styles.slider}
          type={'range'} defaultValue={0} min={-5} max={5} step={0.1}
          disabled={role === 'student' && mode === 'captain'}
          onChange={(e) => {
            setY?.(e.target.valueAsNumber)
          }}
        />
      </div>
      <math-field class={styles.math} ref={yFunctionRef} read-only></math-field>
    </div>
  </div>
}
