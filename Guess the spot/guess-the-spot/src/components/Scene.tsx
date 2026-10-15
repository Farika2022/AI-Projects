import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Globe from './Globe'

const GLOBE_RADIUS = 2

export default function Scene() {
  return (
    <Canvas className="h-full w-full" camera={{ position: [0, 0, 6], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />

      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={0.5} />

      <Suspense fallback={null}>
        <Globe radius={GLOBE_RADIUS} />
      </Suspense>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enablePan={false}
        enableDamping
        minDistance={GLOBE_RADIUS + 1}
        maxDistance={10}
      />
    </Canvas>
  )
}
