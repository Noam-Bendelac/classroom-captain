import { ComputeEngine } from '@cortex-js/compute-engine'
import { ControllerContext } from 'controller/controller'
import { useCallback, useContext, useEffect, useRef } from 'react'
import { Color, DoubleSide, Group, PlaneGeometry } from 'three'
import shallow from 'zustand/shallow'
import { useMemoCleanup } from '../util'




export const CE = new ComputeEngine()

export function MultivarScene({  }: {  }) {
  // make z up
  return <group
    rotation={[-Math.PI/2, 0, -Math.PI/2]}
  >
    <FunctionSurface />
    <IntersectionCurve dir={'x'} />
    <IntersectionCurve dir={'y'} />
  </group>
}

function FunctionSurface({  }: {  }) {
  
  const geometry = useMemoCleanup(
    useCallback(() => new PlaneGeometry(10, 10, 30, 30), []),
    useCallback((geometry) => geometry.dispose(), []),
  )
  
  const store = useContext(ControllerContext)
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? store.func : null,
    func => {
      if (func === null) return;
      // here we treat z like up
      const position = geometry.getAttribute('position')
      for (let i = 0; i < position.count; i++) {
        CE.set({ x: position.getX(i), y: position.getY(i) })
        const z = func.N().valueOf() as number
        if (!Number.isFinite(z)) break;
        // console.log(z)
        position.setZ(i, z)
      }
      position.needsUpdate = true
      geometry.computeVertexNormals()
    },
    { fireImmediately: true, equalityFn: shallow }
  ), [geometry, store])
  
  // by default, plane normal is towards z; because we are in z-up, this works fine
  return <mesh geometry={geometry}>
    <meshStandardMaterial
      color={'red'}
      opacity={0.7}
      transparent
      roughness={0.3}
      metalness={0}
      side={DoubleSide}
    />
  </mesh>
}


function IntersectionCurve({ dir, }: { dir: 'x' | 'y' }) {
  const geometries = useMemoCleanup(
    useCallback(() => Array.from({ length: 4 }, () => new PlaneGeometry(10, 1, 30, 1)), []),
    useCallback((geometries) => geometries.forEach(g => g.dispose()), []),
  )
  
  const groupRef = useRef<Group>(null)
  
  const store = useContext(ControllerContext)
  useEffect(() => store.subscribe(
    (store) => store.topic === 'multivar' ? [
      store.func,
      // if in x direction, the constant is y
      dir === 'x' ? store.y : store.x,
    ] as const : null,
    state => {
      if (state === null) return;
      const [func, constant] = state
      
      // here we are in z-up
      
      // position y at constant if dir is x; position x at constant if dir is y
      // groupRef.current?.position.setScalar(0).setComponent(dir === 'x' ? 1 : 0, constant)
      if (dir === 'x') {
        groupRef.current?.position.set(0, constant, 0)
        groupRef.current?.scale.set(1, 1, 1)
        groupRef.current?.rotation.set(0,0,0)
      } else {
        groupRef.current?.position.set(constant, 0, 0)
        groupRef.current?.scale.set(1, -1, 1)
        groupRef.current?.rotation.set(0, 0, Math.PI/2)
      }
      console.log(dir === 'x' ? 1 : 0, constant, groupRef.current?.position)
      
      // here we treat z like up, position.x is always the progress along the line,
      // and position.y is always the slider constant
      const positions = geometries.map(g => g.getAttribute('position'))
      // console.log(position)
      const halfCount = positions[0].count / 2
      for (let i = 0; i < halfCount; i++) {
        const progress = positions[0].getX(i)
        const width = 0.12
        const height = 0.05
        
        if (dir === 'x') {
          CE.set({ x: progress, y: constant })
        } else {
          CE.set({ x: constant, y: progress })
        }
        const z1 = func.N().valueOf() as number
        if (!Number.isFinite(z1)) break;
        
        if (dir === 'x') {
          CE.set({ x: progress, y: constant + width })
        } else {
          CE.set({ x: constant + width, y: progress })
        }
        const zRight = func.N().valueOf() as number
        if (!Number.isFinite(zRight)) break;
        
        if (dir === 'x') {
          CE.set({ x: progress, y: constant - width })
        } else {
          CE.set({ x: constant - width, y: progress })
        }
        const zLeft = func.N().valueOf() as number
        if (!Number.isFinite(zLeft)) break;
        
        positions[3].setXYZ(i + halfCount, progress, + 0,     z1 + height)
        positions[0].setXYZ(i,             progress, + 0,     z1 + height)
        positions[0].setXYZ(i + halfCount, progress, + width, zRight + 0)
        positions[1].setXYZ(i,             progress, + width, zRight + 0)
        positions[1].setXYZ(i + halfCount, progress, + 0,     z1 - height)
        positions[2].setXYZ(i,             progress, + 0,     z1 - height)
        positions[2].setXYZ(i + halfCount, progress, - width, zLeft + 0)
        positions[3].setXYZ(i,             progress, - width, zLeft + 0)
      }
      positions.forEach(p => { p.needsUpdate = true })
      geometries.forEach(g => g.computeVertexNormals())
    },
    { fireImmediately: true, equalityFn: shallow }
  ), [dir, geometries, store])
  
  return <group ref={groupRef}>
    { geometries.map((geometry, index) => <mesh geometry={geometry} key={index}>
      <meshStandardMaterial
        color={new Color().setHSL(200/360, 0.85, 0.65).convertSRGBToLinear()}
        // opacity={0.8}
        // transparent
        roughness={0.3}
        metalness={1}
        side={DoubleSide}
      />
    </mesh>)}
  </group>
}

