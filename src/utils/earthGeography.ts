import * as THREE from 'three';
import { latLngToVector3 } from './geo';

/**
 * Loads the realistic high-resolution NASA Blue Marble / Natural Earth diffuse texture
 * and high-fidelity topographic relief bump map.
 */
export function loadRealisticEarthTextures(onLoad?: () => void): {
  map: THREE.Texture;
  bumpMap: THREE.Texture;
} {
  const loader = new THREE.TextureLoader();

  const map = loader.load(
    '/assets/earth/earth-blue-marble.jpg',
    () => {
      if (onLoad) onLoad();
    },
    undefined,
    (err) => {
      console.warn('Could not load local Earth diffuse map, using fallback:', err);
    }
  );
  map.colorSpace = THREE.SRGBColorSpace;
  map.generateMipmaps = true;
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.magFilter = THREE.LinearFilter;

  const bumpMap = loader.load(
    '/assets/earth/earth-topology.png',
    undefined,
    undefined,
    (err) => {
      console.warn('Could not load local Earth bump map:', err);
    }
  );
  bumpMap.generateMipmaps = true;
  bumpMap.minFilter = THREE.LinearMipmapLinearFilter;
  bumpMap.magFilter = THREE.LinearFilter;

  return { map, bumpMap };
}

/**
 * Fetches real Natural Earth country boundary GeoJSON data and constructs
 * accurate, delicate golden country borders onto the 3D sphere.
 */
export async function loadCountryBorders(globeRadius: number): Promise<THREE.LineSegments | null> {
  try {
    const res = await fetch('/assets/earth/ne_110m_admin_0_countries.geojson');
    if (!res.ok) {
      console.warn('Natural Earth GeoJSON response not ok:', res.status);
      return null;
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.features)) return null;

    const coordsArray: number[] = [];
    const r = globeRadius * 1.0025; // Slight elevation above terrain to prevent z-fighting

    for (const feature of data.features) {
      const geom = feature.geometry;
      if (!geom) continue;

      const polys: number[][][][] =
        geom.type === 'Polygon'
          ? [geom.coordinates]
          : geom.type === 'MultiPolygon'
          ? geom.coordinates
          : [];

      for (const poly of polys) {
        for (const ring of poly) {
          for (let i = 0; i < ring.length - 1; i++) {
            const p1 = ring[i];
            const p2 = ring[i + 1];
            if (
              typeof p1[0] !== 'number' ||
              typeof p1[1] !== 'number' ||
              typeof p2[0] !== 'number' ||
              typeof p2[1] !== 'number'
            ) {
              continue;
            }

            const v1 = latLngToVector3(p1[1], p1[0], r);
            const v2 = latLngToVector3(p2[1], p2[0], r);

            coordsArray.push(v1.x, v1.y, v1.z);
            coordsArray.push(v2.x, v2.y, v2.z);
          }
        }
      }
    }

    if (coordsArray.length === 0) return null;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(coordsArray, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0xd6b36b, // Antique Gold
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });

    const lineSegments = new THREE.LineSegments(geometry, material);
    lineSegments.name = 'countryBorders';
    return lineSegments;
  } catch (err) {
    console.warn('Failed to parse Natural Earth country borders:', err);
    return null;
  }
}

/**
 * Creates a soft atmospheric scattering layer around the 3D Earth,
 * combining soft celestial cyan-blue scatter and warm golden rim illumination.
 */
export function createAtmosphereMesh(globeRadius: number): THREE.Group {
  const group = new THREE.Group();

  // 1. Soft Rayleigh scattering halo (outer bluish glow)
  const outerGeo = new THREE.SphereGeometry(globeRadius * 1.022, 64, 64);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x5ea3c7,
    transparent: true,
    opacity: 0.16,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  group.add(outerMesh);

  // 2. Warm golden celestial rim sheen (fairytale manuscript aesthetic)
  const innerGeo = new THREE.SphereGeometry(globeRadius * 1.008, 64, 64);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xd6b36b,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerMesh);

  return group;
}
