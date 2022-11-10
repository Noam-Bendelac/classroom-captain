import React, { createContext, useEffect, useMemo } from 'react'
import { Vector3 } from 'three'
import { createStore, StoreApi as StoreApiCore, StoreMutators } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'


// this is what we have to do to get access to the type of the API created by subscribeWithSelector
type StoreApi<S> = StoreMutators<StoreApiCore<S>, unknown>['zustand/subscribeWithSelector']

const host = 'localhost'
const backendPort = '1234'


export type Role = 'teacher' | 'student' | 'neither'

type Mode = 'explorer' | 'captain'



// "controlled state" means the store is the source of truth, "uncontrolled
// state" means some child component is the source of truth
// this is unrelated to whether an action is available to the user to update state
export interface Store {
  // important controlled states
  role: Role,
  mode: Mode,
  
  // uncontrolled component will be pushed controlled state, but only when
  // student role & explorer mode
  cameraPosition: Vector3 | null,
  // controlled states
  // TODO e.g. section
  
  // "set" for controlled state
  setMode: (mode: Mode) => void,
  // "onChange" for uncontrolled state
  onCameraChange: (position: Vector3) => void,
}

interface StorePrivate extends Store {
  _setMode: (mode: Mode) => void,
  _setCameraPosition: (position: Vector3) => void,
}


// // different user actions available to different roles+modes
// type S =
//   | Pick<Store, 'setMode' | 'onCameraChange'> & {
//     role: 'teacher',
//     mode: 'captain'
//   }
//   | Pick<Store, 'setMode'> & {
//     role: 'teacher',
//     mode: 'explorer'
//   }
//   | Pick<Store, 'cameraPosition'> & {
//     role: 'student',
//     mode: 'captain'
//   }
//   | Pick<Store, never> & {
//     role: 'student',
//     mode: 'explorer'
//   }


function useController(role: Role) {
  
  
  const ws = useMemo(() => {
    const ws = new WebSocket(`ws://${host}:${backendPort}/`)
    
    ws.addEventListener('error', evt => console.log('ws error!', evt))
    return ws
  }, [role])
  
  
  const storePrivate: StoreApi<StorePrivate> = useMemo(() =>
    createStore<StorePrivate>()(
    subscribeWithSelector((set, get) => ({
      role,
      mode: 'explorer',
      cameraPosition: null,
      
      setMode: (mode) => {
        if (get().role === 'teacher') {
          set({ mode })
          ws.send(JSON.stringify({ mode }))
        }
      },
      onCameraChange: (position) => {
        if (get().role === 'teacher' && get().mode === 'captain') {
          // will possibly throttle here
          ws.send(JSON.stringify({ camera: position.toArray() }))
        }
      },
      
      _setMode: mode => set({ mode }),
      _setCameraPosition: position => set({ cameraPosition: position }),
      
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
          storePrivate.getState()._setMode(message.mode)
        }
        if (message.camera && message.camera.length) {
          const [x, y, z] = message.camera as number[]
          storePrivate.getState()._setCameraPosition(new Vector3(x, y, z))
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

