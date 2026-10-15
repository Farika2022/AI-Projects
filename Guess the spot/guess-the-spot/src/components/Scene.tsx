import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Globe from './Globe'
import Marker from './Marker'
import locationsData from '../data/locations.json'
import type { Location } from '../types'

const GLOBE_RADIUS = 2
const locations: Location[] = locationsData

function handleMarkerClick(location: Location) {
  console.log(location.name)
}

export default function Scene() {
  return (
    <Canvas className="h-full w-full" camera={{ position: [0, 0, 6], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />

      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={0.5} />

      <Suspense fallback={null}>
        {/* Markers share a group with the globe so they always move with it */}
        <group>
          <Globe radius={GLOBE_RADIUS} />
          {locations.map((location) => (
            <Marker
              key={location.id}
              location={location}
              globeRadius={GLOBE_RADIUS}
              onClick={handleMarkerClick}
            />
          ))}
        </group>
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
