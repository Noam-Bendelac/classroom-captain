import { BoxedExpression } from '@cortex-js/compute-engine'
import React, { createContext, useEffect, useMemo } from 'react'
import { Vector3 } from 'three'
import { CE } from 'ui3d/UI3D'
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



function useController(role: Role) {
  
  
  const ws = useMemo(() => {
    const ws = new WebSocket(`ws://${process.env.REACT_APP_BACKEND_HOSTPORT}/`)
    
    ws.addEventListener('error', evt => console.log('ws error!', evt))
    return ws
  }, [role])
  
  
  const storePrivate: StoreApi<StorePrivate> = useMemo(() =>
    createStore<StorePrivate>()(
    subscribeWithSelector((set, get) => construct<StorePrivate>({
      mode: 'explorer',
      topic: 'multivar',
      
      cameraPosition: null,
      
      func: CE.parse('f(x,y)=x'),
      x: 0,
      y: 0,
      
      setMode: (mode) => {
        if (role === 'teacher') {
          set({ mode })
          ws.send(JSON.stringify({ mode }))
        }
      },
      setTopic: (topic) => {
        if (role === 'teacher') {
          // if teacher, update server
          ws.send(JSON.stringify({ topic }))
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
      setFunc: func => {
        if (role === 'teacher') {
          try {
            ws.send(JSON.stringify({ func: func.latex }))
          }
          catch {}
        }
        set({ func })
      },
      setX: x => {
        if (role === 'teacher') {
          ws.send(JSON.stringify({ x }))
        }
        set({ x })
      },
      setY: y => {
        if (role === 'teacher') {
          ws.send(JSON.stringify({ y }))
        }
        set({ y })
      },
      onCameraChange: (position) => {
        if (role === 'teacher' && get().mode === 'captain') {
          // will possibly throttle here
          ws.send(JSON.stringify({ camera: position.toArray() }))
        }
      },
      
      // _setMode: mode => set({ mode }),
      // _setCameraPosition: position => set({ cameraPosition: position }),
      
      _set: partial => set(partial),
      
      // isTeacher: () => get().role === 'teacher',
      // isStudent: () => get().role === 'student',
      // inCaptain: () => get().mode === 'captain',
      // inExplorer: () => get().mode === 'explorer',
    }))
  ), [ws, role])
  
  
  useEffect(() => {
    ws.addEventListener('message', (evt: MessageEvent<string>) => {
      console.log('message!', evt)
      if (role === 'student') {
        const message: Record<string, string | number[]> = JSON.parse(evt.data)
        if (message.mode && (message.mode === 'explorer' || message.mode === 'captain')) {
          storePrivate.getState()._set({ mode: message.mode })
        }
        if (message.camera && message.camera.length) {
          const [x, y, z] = message.camera as number[]
          storePrivate.getState()._set({ cameraPosition: new Vector3(x, y, z) })
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
  role,
  children,
}: React.PropsWithChildren & {
  role: Role,
}) {
  const store = useController(role)
  
  window._store = store
  window.Vector3 = Vector3
  
  return <ControllerContext.Provider value={store}>
    { children }
  </ControllerContext.Provider>
}

