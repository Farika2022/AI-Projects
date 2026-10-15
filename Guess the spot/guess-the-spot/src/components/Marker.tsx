import { useMemo, useState } from 'react'
import { useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { Location } from '../types'
import { latLngToVector3 } from '../utils/latLngToVector3'

const MARKER_SIZE = 0.035
const HOVER_SCALE = 1.5
const COLOR = '#ffcc33'

type MarkerProps = {
  location: Location
  globeRadius: number
  onClick: (location: Location) => void
}

export default function Marker({ location, globeRadius, onClick }: MarkerProps) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  // Sit just above the surface so the marker isn't half-buried in the globe.
  const position = useMemo(
    () => latLngToVector3(location.lat, location.lng, globeRadius + MARKER_SIZE / 2),
    [location.lat, location.lng, globeRadius],
  )

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick(location)
  }

  return (
    <group
      position={position}
      scale={hovered ? HOVER_SCALE : 1}
      onPointerOver={handleOver}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <mesh>
        <sphereGeometry args={[MARKER_SIZE, 16, 16]} />
        <meshBasicMaterial color={COLOR} toneMapped={false} />
      </mesh>
      {/* Soft halo for the glow effect */}
      <mesh>
        <sphereGeometry args={[MARKER_SIZE * 2, 16, 16]} />
        <meshBasicMaterial
          color={COLOR}
          transparent
          opacity={0.25}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
