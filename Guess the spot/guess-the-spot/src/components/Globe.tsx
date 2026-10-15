import { useTexture } from '@react-three/drei'
import { SRGBColorSpace } from 'three'

const EARTH_TEXTURE_URL =
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'

type GlobeProps = {
  radius?: number
}

export default function Globe({ radius = 2 }: GlobeProps) {
  const texture = useTexture(EARTH_TEXTURE_URL, (loaded) => {
    loaded.colorSpace = SRGBColorSpace
  })

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}
