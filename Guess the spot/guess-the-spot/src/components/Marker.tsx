import { useMemo, useState } from 'react'
import { useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { Location } from '../types'
import { latLngToVector3 } from '../utils/latLngToVector3'

const MARKER_SIZE = 0.035
const HOVER_SCALE = 1.5
const COLOR = '#ffcc33'
const ANSWERED_COLOR = '#6b7280'

type MarkerProps = {
  location: Location
  globeRadius: number
  answered: boolean
  disabled: boolean
  onClick: (location: Location) => void
}

export default function Marker({ location, globeRadius, answered, disabled, onClick }: MarkerProps) {
  const [hovered, setHovered] = useState(false)
  const interactive = !answered && !disabled
  const active = hovered && interactive
  useCursor(active)

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
    if (interactive) onClick(location)
  }

  const color = answered ? ANSWERED_COLOR : COLOR

  return (
    <group
      position={position}
      scale={active ? HOVER_SCALE : 1}
      onPointerOver={handleOver}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <mesh>
        <sphereGeometry args={[MARKER_SIZE, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Soft halo for the glow effect */}
      <mesh>
        <sphereGeometry args={[MARKER_SIZE * 2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={answered ? 0.1 : 0.25}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
