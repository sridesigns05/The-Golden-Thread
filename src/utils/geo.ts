import * as THREE from 'three';

/**
 * Converts geographical latitude and longitude to 3D Cartesian coordinates on a sphere.
 * @param lat Latitude in degrees [-90, 90]
 * @param lng Longitude in degrees [-180, 180]
 * @param radius Radius of the sphere
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Creates a graceful 3D quadratic bezier curve between two points on the globe,
 * elevating smoothly into celestial space proportional to great-circle distance.
 */
export function createArcCurve(
  vStart: THREE.Vector3,
  vEnd: THREE.Vector3,
  globeRadius: number,
  heightMultiplier = 0.35
): THREE.QuadraticBezierCurve3 {
  // Distance between points
  const distance = vStart.distanceTo(vEnd);
  // Midpoint between the two vectors
  const midPoint = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);

  // Normalize midpoint to point radially outward from globe origin
  const midLength = midPoint.length();
  if (midLength > 0.0001) {
    midPoint.normalize();
  } else {
    // If antipodal, create an orthogonal vector
    midPoint.set(0, 1, 0);
  }

  // Elevate mid control point
  const arcHeight = globeRadius + Math.max(distance * heightMultiplier, 0.4);
  midPoint.multiplyScalar(arcHeight);

  return new THREE.QuadraticBezierCurve3(vStart, midPoint, vEnd);
}

/**
 * Computes camera target position that looks directly down on a lat/lng coordinate
 * at a specified camera distance.
 */
export function getCameraLookPosition(lat: number, lng: number, distance: number): THREE.Vector3 {
  return latLngToVector3(lat, lng, distance);
}
