import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Globe from './Globe'
import Marker from './Marker'
import { locations } from '../data/locations'
import type { Location } from '../types'

const GLOBE_RADIUS = 2

type SceneProps = {
  answeredIds: string[]
  paused: boolean
  /** Markers ignore clicks (e.g. before the game starts or after it ends). */
  disabled: boolean
  onSelectLocation: (location: Location) => void
}

export default function Scene({ answeredIds, paused, disabled, onSelectLocation }: SceneProps) {
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
              answered={answeredIds.includes(location.id)}
              disabled={disabled}
              onClick={onSelectLocation}
            />
          ))}
        </group>
      </Suspense>

      <OrbitControls
        autoRotate={!paused}
        autoRotateSpeed={0.4}
        enablePan={false}
        enableDamping
        minDistance={GLOBE_RADIUS + 1}
        maxDistance={10}
      />
    </Canvas>
  )
}
