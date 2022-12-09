import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Environment, OrbitControls as OrbitControlsDrei, OrthographicCamera } from '@react-three/drei'
import { Color, DoubleSide, PlaneGeometry, TextureLoader } from 'three'
import { OrbitControls } from 'three-stdlib'
import { ControllerContext } from 'controller/controller'
import { useStore } from 'zustand'
import { BoxedExpression, ComputeEngine } from '@cortex-js/compute-engine'
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
  return <>
    <FunctionSurface />
  </>
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
  ))
  
  // by default, plane normal is towards z; here we make z up
  return <mesh geometry={geometry} rotation={[-Math.PI/2, 0, -Math.PI/2]}>
    <meshStandardMaterial
      color={'red'}
      // opacity={0.8}
      // transparent
      roughness={0.3}
      metalness={1}
      side={DoubleSide}
    />
  </mesh>
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


