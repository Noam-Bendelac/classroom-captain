import { useEffect } from 'react'
import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Environment, OrthographicCamera } from '@react-three/drei'
import { Color, DoubleSide, Euler, TextureLoader } from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"



export function UI3D() {
  
  
  return <Canvas>
    <Scene />
  </Canvas>
}


function Scene() {
  useOrbitControls()
  
  return <>
    <axesHelper />
    <OrthographicCamera
      makeDefault
      // left={-5} right={5}
      // top={50} bottom={-50}
      zoom={50}
    />
    <Environment files={'/assets/belfast_sunset_puresky_1k.hdr'} />
    
    <LeftSection />
    <FrontSection />
    <Copper3 />
  </>
  
}


function Copper1() {
  // mesh phong material
  return <>
    
    <directionalLight
      position={[0, 5, 4]}
      intensity={0.8}
    />
    <directionalLight
      position={[0, 1, -4]}
      intensity={0.5}
    />
    <ambientLight
      // color={new Color(1, 1, 1)}
      intensity={0.09}
    />
    <mesh>
      <torusGeometry args={[
        2, 0.5,
        16, 50,
      ]} />
      
      <meshPhongMaterial
        color={new Color().setHSL(18/360, 1, 0.7).convertSRGBToLinear()}
        specular={new Color().setHSL(23/360, 1, 0.5).convertSRGBToLinear()}
        shininess={40}
      />
    </mesh>
  </>
}
function Copper2() {
  // mesh standard material (pbr) with no environment
  return <>
    <directionalLight
      position={[0, 5, 4]}
      intensity={1.8}
    />
    <directionalLight
      position={[0, 1, -4]}
      intensity={1.5}
    />
    <ambientLight
      // color={new Color(1, 1, 1)}
      intensity={0.2}
    />
    <mesh>
      <torusGeometry args={[
        2, 0.5,
        16, 50,
      ]} />
      <meshStandardMaterial
        color={new Color().setHSL(18/360, 1.0, 0.68).convertSRGBToLinear()}
        metalness={0.6}
        roughness={0.4}
      />
    </mesh>
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



function useOrbitControls() {
  const { camera, gl } = useThree()
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.maxDistance = 100
    camera.position.set(3, 3, 3)
    controls.update()
    return () => {
      controls.dispose()
    }
  }, [camera, gl])
}
