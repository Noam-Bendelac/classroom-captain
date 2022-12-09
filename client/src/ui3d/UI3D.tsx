import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Environment, OrbitControls as OrbitControlsDrei, OrthographicCamera } from '@react-three/drei'
import { BoxGeometry, Color, CylinderGeometry, DoubleSide, Group, Mesh, PlaneGeometry, TextureLoader } from 'three'
import { OrbitControls } from 'three-stdlib'
import { ControllerContext } from 'controller/controller'
import { useStore } from 'zustand'
import { BoxedExpression, ComputeEngine } from '@cortex-js/compute-engine'
// import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { useMemoCleanup } from '../util'



export function UI3D({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement>,
}) {
  return <Canvas>
    <Scene parentRef={parentRef} />
  </Canvas>
}


function Scene({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement>,
}) {
  const controlsRef = useRef<OrbitControls>(null)
  
  const store = useContext(ControllerContext)
  useEffect(() => store.subscribe(
    ({ cameraPosition }) => cameraPosition,
    cameraPosition => {
      // receive camera position pushes from central state
      if (cameraPosition) {
        controlsRef.current?.object.position.copy(cameraPosition)
        controlsRef.current?.update()
      }
    }
  ))
  
  const onCameraChange = useStore(store, ({ onCameraChange }) => onCameraChange)
  
  const topic = useStore(store, ({ topic }) => topic)
  
  const camera = useThree(({ camera }) => camera)
  
  useProperResize(parentRef)
  
  return <group rotation={topic === 'multivar' ? [0, Math.PI, 0] : [0,0,0]}>
    <axesHelper />
    
    <OrthographicCamera
      makeDefault
      // left={-5} right={5}
      // top={50} bottom={-50}
      zoom={50}
      position={[20,20,20]}
    />
    
    <OrbitControlsDrei
      ref={controlsRef}
      onChange={() => {
        onCameraChange(camera.position)
      }}
      enableDamping={false}
    />
    
    <Environment files={'/assets/belfast_sunset_puresky_1k.hdr'} />
    
    {/* <SceneContents /> */}
    <MultivarScene />
  </group>
  
}


export const CE = new ComputeEngine()

function MultivarScene({  }: {  }) {
  // make z up
  return <group rotation={[-Math.PI/2, 0, -Math.PI/2]}>
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
    { fireImmediately: true }
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
  // const geometry = useMemoCleanup(
  //   useCallback(() => new MeshLineGeometry(), []),
  //   useCallback((geometry) => geometry.dispose(), []),
  // )
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
      groupRef.current?.position.setScalar(0).setComponent(dir === 'x' ? 1 : 0, constant)
      if (dir === 'x') {
        groupRef.current?.rotation.set(0,0,0)
      } else {
        groupRef.current?.rotation.set(0, 0, Math.PI/2)
      }
      
      // here we treat z like up, position.x is always the progress along the line,
      // and position.y is always the slider constant
      const positions = geometries.map(g => g.getAttribute('position'))
      // console.log(position)
      const halfCount = positions[0].count / 2
      for (let i = 0; i < halfCount; i++) {
        const progress = positions[0].getX(i)
        if (dir === 'x') {
          CE.set({ x: progress, y: constant })
        } else {
          CE.set({ x: constant, y: progress })
        }
        const z = func.N().valueOf() as number
        if (!Number.isFinite(z)) break;
        const width = 0.15
        const height = 0.05
        positions[3].setXYZ(i + halfCount, progress, constant + 0,     z + height)
        positions[0].setXYZ(i,             progress, constant + 0,     z + height)
        positions[0].setXYZ(i + halfCount, progress, constant + width, z + 0)
        positions[1].setXYZ(i,             progress, constant + width, z + 0)
        positions[1].setXYZ(i + halfCount, progress, constant + 0,     z - height)
        positions[2].setXYZ(i,             progress, constant + 0,     z - height)
        positions[2].setXYZ(i + halfCount, progress, constant - width, z + 0)
        positions[3].setXYZ(i,             progress, constant - width, z + 0)
      }
      positions.forEach(p => { p.needsUpdate = true })
      geometries.forEach(g => g.computeVertexNormals())
    },
    { fireImmediately: true }
  ), [dir, geometries, store])
  
  return <group ref={groupRef}>
    { geometries.map(geometry => <mesh geometry={geometry}>
      <meshStandardMaterial
        color={'green'}
        // opacity={0.8}
        // transparent
        roughness={0.3}
        metalness={1}
        side={DoubleSide}
      />
    </mesh>)}
  </group>
}



function SceneContents() {
  return <>
    <LeftSection />
    <FrontSection />
    <Copper3 />
  </>
}


function Copper3() {
  // mesh standard material (pbr) with environment
  
  
  return <>
    
    <mesh
      rotation={[0, 0, -Math.PI / 2]}
    >
      <torusGeometry args={[
        4, 0.5,
        16, 100,
        // Math.PI
      ]} />
      {/* <torusGeometry
        parameters={{
          radius: 4,
          tube: 0.5,
          radialSegments: 16,
          tubularSegments: 100,
          arc: Math.PI,
        }}
      /> */}
      <meshStandardMaterial
        color={new Color().setHSL(18/360, 0.9, 0.68).convertSRGBToLinear()}
        metalness={1.0}
        roughness={0.18}
      />
    </mesh>
  </>
}



function LeftSection() {
  const image = useLoader(TextureLoader, '/assets/textbook screenshot left view transparent.png')
  return <mesh
    position={[0, 0.4, 0]}
    rotation={[0, -Math.PI/2, 0]}
  >
    <planeGeometry args={[19, 19/6*7]} />
    <meshBasicMaterial
      color={'#ffffff'}
      map={image}
      transparent
      side={DoubleSide}
      alphaTest={0.1}
    />
  </mesh>
}

function FrontSection() {
  const image = useLoader(TextureLoader, '/assets/textbook screenshot front view transparent.png')
  return <mesh
    position={[0, 0.1, 0]}
    // rotation={[0, -Math.PI/2, 0]}
  >
    <planeGeometry args={[11.6, 11.6]} />
    <meshBasicMaterial
      color={'#ffffff'}
      map={image}
      transparent
      side={DoubleSide}
      alphaTest={0.1}
    />
  </mesh>
}


function useProperResize(parentRef: React.RefObject<HTMLDivElement>) {
  const gl = useThree(({ gl }) => gl)
  
  useEffect(() => {
    const handler = () => {
      // console.log(parentRef)
      if (!parentRef.current) return;
      const width  = parentRef.current.clientWidth;
      const height = parentRef.current.clientHeight;
      
      gl.setSize(width, height, false);
    }
    const parent = parentRef.current
    parent?.addEventListener('resize', handler)
    return () => parent?.removeEventListener('resize', handler)
  }, [gl, parentRef])
}


