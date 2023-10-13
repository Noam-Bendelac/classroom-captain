import { BoxedExpression } from '@cortex-js/compute-engine'
import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { Vector3 } from 'three'
import { roleContext } from 'ui2d/App'
import { CE } from 'ui3d/MultivarScene'
import { createStore, StoreApi as StoreApiCore, StoreMutators } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'


// this is what we have to do to get access to the type of the API created by subscribeWithSelector
type StoreApi<S> = StoreMutators<StoreApiCore<S>, unknown>['zustand/subscribeWithSelector']



export type Role = 'teacher' | 'student' | 'neither'

type Mode = 'explorer' | 'captain'


export type Topic = 'magnetism' | 'multivar'



// "controlled state" means the store is the source of truth, "uncontrolled
// state" means some child component is the source of truth
// this is unrelated to whether an action is available to the user to update state
interface StoreBase {
  // important controlled states
  mode: Mode,
  topic: Topic,
  
  // uncontrolled component will be pushed controlled state, but only when
  // student role & explorer mode
  cameraPosition: Vector3 | null,
  // controlled states
  // TODO e.g. section
  
  // "set" for controlled state
  setMode: (mode: Mode) => void,
  setTopic: (topic: Topic) => void,
  // "onChange" for uncontrolled state
  onCameraChange: (position: Vector3) => void,
  
  // _set: (partial: Partial<this>) => void,
}



interface MagnetismStore extends StoreBase {
  topic: 'magnetism',
}

interface MultivarStore extends StoreBase {
  topic: 'multivar',
  func: BoxedExpression,
  x: number,
  y: number,
  setFunc: (func: BoxedExpression) => void,
  setX: (x: number) => void,
  setY: (y: number) => void,
}


export type Store = MagnetismStore | MultivarStore
// export type Store = Omit<StorePrivate, '_set'>
type StorePrivate = Store & {
  _set: (partial: Partial<Store>) => void,
}

// let s: StorePrivate = {_set: () => void 0, cameraPosition: new Vector3(), mode: 'captain', setMode: () => void 0, setTopic: () => void 0, onCameraChange: () => void 0, topic: 'magnetism'}
function test(s: Store) {
  
  if (s.topic === 'multivar') {
    console.log(s.func)
  }
}


const construct = <T extends any>(t: T) => t



function useController() {
  const role = useContext(roleContext)
  
  const ws = useMemo(() => {
    const ws = process.env.REACT_APP_BACKEND_HOST
      ? new WebSocket(`ws${process.env.REACT_APP_SECURE === 'true' ? 's' : ''}://${process.env.REACT_APP_BACKEND_HOST}/`)
      : null
    
    ws?.addEventListener('error', evt => console.log('ws error!', evt))
    return ws
  }, [role])
  
  
  const storePrivate: StoreApi<StorePrivate> = useMemo(() =>
    createStore<StorePrivate>()(
    subscribeWithSelector((set, get) => construct<StorePrivate>({
      mode: 'explorer',
      // cursed typescript hack
      topic: 'magnetism' as 'multivar',
      
      cameraPosition: null,
      
      func: CE.parse('f(x,y)=x'),
      x: 0,
      y: 0,
      
      setMode: (mode) => {
        if (role === 'teacher') {
          set({ mode })
          ws?.send(JSON.stringify({ mode }))
        }
      },
      setTopic: (topic) => {
        if (role === 'teacher') {
          // if teacher, update server
          ws?.send(JSON.stringify({ topic }))
        }
        // we have control over topic if teacher, or if student in explorer mode
        // in other words, as long as we are not a student in captain mode
        if (!(role === 'student' && get().mode === 'captain')) {
          // typescript weirdness:
          if (topic === 'multivar') {
            set({
              topic,
              // func: CE.parse('f(x,y)=x'),
              // x: 0,
              // y: 0,
              // setFunc: func => set({})
            })
          } else {
            set({ topic })
          }
        }
      },
      setFunc: (func: BoxedExpression) => {
        if (role === 'teacher') {
          try {
            ws?.send(JSON.stringify({ func: func.latex }))
          }
          catch {}
        }
        // we have control over func if teacher, or if student in explorer mode
        // in other words, as long as we are not a student in captain mode
        if (!(role === 'student' && get().mode === 'captain')) {
          set({ func })
        }
      },
      setX: x => {
        if (role === 'teacher') {
          ws?.send(JSON.stringify({ x }))
        }
        // we have control over sliders if teacher, or if student in explorer mode
        // in other words, as long as we are not a student in captain mode
        if (!(role === 'student' && get().mode === 'captain')) {
          set({ x })
        }
      },
      setY: y => {
        if (role === 'teacher') {
          ws?.send(JSON.stringify({ y }))
        }
        // we have control over sliders if teacher, or if student in explorer mode
        // in other words, as long as we are not a student in captain mode
        if (!(role === 'student' && get().mode === 'captain')) {
          set({ y })
        }
      },
      onCameraChange: (position) => {
        if (role === 'teacher') {
          // will possibly throttle here
          ws?.send(JSON.stringify({ camera: position.toArray() }))
        }
      },
      
      _set: partial => set(partial),
      
    }))
  ), [ws, role])
  
  
  useEffect(() => {
    ws?.addEventListener('message', (evt: MessageEvent<string>) => {
      console.log('message!', evt)
      if (role === 'student') {
        const message: Record<string, string | number | number[]> = JSON.parse(evt.data)
        if (message.mode && (message.mode === 'explorer' || message.mode === 'captain')) {
          storePrivate.getState()._set({ mode: message.mode })
        }
        if (storePrivate.getState().mode === 'captain') {
          if (message.topic && (message.topic === 'magnetism' || message.topic === 'multivar')) {
            storePrivate.getState()._set({ topic: message.topic })
          }
          if (message.camera && Array.isArray(message.camera)) {
            const [x, y, z] = message.camera
            storePrivate.getState()._set({ cameraPosition: new Vector3(x, y, z) })
          }
          if (message.func && typeof message.func === 'string') {
            storePrivate.getState()._set({ func: CE.parse(message.func) })
          }
          if (message.x && Number.isFinite(message.x)) {
            storePrivate.getState()._set({ x: message.x as number })
          }
          if (message.y && Number.isFinite(message.y)) {
            storePrivate.getState()._set({ y: message.y as number })
          }
        }
      }
    })
    // TODO
  }, [ws, role, storePrivate])
  
  const store: StoreApi<Store> = storePrivate
  
  return store
}



// i believe context consumers will always consume after the initial value is
// set by the provider, so they will never get null
export const ControllerContext = createContext<StoreApi<Store>>(null!)


export function ControllerProvider({
  children,
}: React.PropsWithChildren) { 
  const store = useController()
  
  window._store = store
  window.Vector3 = Vector3
  
  return <ControllerContext.Provider value={store}>
    { children }
  </ControllerContext.Provider>
}

