import { MathUtils, Vector3 } from 'three'

// Matches three.js SphereGeometry's default UV mapping, so a point lands on
// the same spot of an equirectangular Earth texture.
export function latLngToVector3(lat: number, lng: number, radius: number): Vector3 {
  const phi = MathUtils.degToRad(90 - lat)
  const theta = MathUtils.degToRad(lng + 180)

  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}
