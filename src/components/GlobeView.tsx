import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StoryData, StoryId } from '../types';
import { STORIES } from '../data/stories';
import { latLngToVector3, createArcCurve } from '../utils/geo';
import { generateCelestialStarTexture } from '../utils/antiqueGlobeTexture';
import { loadRealisticEarthTextures, loadCountryBorders, createAtmosphereMesh } from '../utils/earthGeography';
import { playGentleClick } from '../utils/audio';

// Module-scope math helpers for zero GC during animation loop
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

interface GlobeViewProps {
  selectedStoryId: StoryId | null;
  focusedStoryId?: StoryId | null;
  onSelectStory: (storyId: StoryId) => void;
  highlightedStoryIds: StoryId[]; // stories illuminated after motif reveal
  activeConnection: { from: StoryId; to: StoryId } | null;
  completedConnections: { storyA: StoryId; storyB: StoryId }[];
  isStoryPanelOpen: boolean;
}

export const GlobeView: React.FC<GlobeViewProps> = ({
  selectedStoryId,
  focusedStoryId,
  onSelectStory,
  highlightedStoryIds,
  activeConnection,
  completedConnections,
  isStoryPanelOpen
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredStory, setHoveredStory] = useState<{ story: StoryData; x: number; y: number } | null>(null);

  // References for mutable scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);

  // Interaction & camera animation state
  const isUserInteractingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const activePointersRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());
  const prevPinchDistanceRef = useRef<number | null>(null);
  const cameraTargetPosRef = useRef<THREE.Vector3 | null>(null);
  const isTransitioningCameraRef = useRef(false);
  // Controls whether idle auto-rotation is allowed. Disabled permanently after first user action or story selection.
  const allowAutoRotateRef = useRef(true);
  const prevFocusedStoryIdRef = useRef<StoryId | null>(null);
  // Default camera distance: 7.6 (25–35% further back than 5.8)
  // Initial orientation: Asia Lat 25°N, Lng 95°E (phi = 1.135 rad, theta = 4.80 rad)
  const sphericalRef = useRef({ radius: 7.6, theta: 4.80, phi: 1.135 });

  // Globe radius constant matching authentic spherical proportions
  const GLOBE_RADIUS = 2.45;

  // Sync camera focus when selectedStoryId changes (only pan once per unique story selection)
  useEffect(() => {
    if (!selectedStoryId) return;
    if (prevFocusedStoryIdRef.current === selectedStoryId) return;
    prevFocusedStoryIdRef.current = selectedStoryId;
    allowAutoRotateRef.current = false; // Permanently stop auto-rotation

    const story = STORIES.find((s) => s.id === selectedStoryId);
    if (!story) return;

    // Focus camera on story coordinates smoothly
    const phi = Math.max(0.2, Math.min(Math.PI - 0.2, (90 - story.coordinates.lat) * (Math.PI / 180)));
    const theta = (story.coordinates.lng + 180) * (Math.PI / 180);

    const targetRadius = 5.2; // closer zoom on selected story
    _targetCamPos.setFromSphericalCoords(targetRadius, phi, theta);

    cameraTargetPosRef.current = _targetCamPos.clone();
    isTransitioningCameraRef.current = true;
  }, [selectedStoryId]);

  // Smoothly rotate and center camera on searched story without opening storybook
  useEffect(() => {
    if (!focusedStoryId) return;
    allowAutoRotateRef.current = false;
    const story = STORIES.find((s) => s.id === focusedStoryId);
    if (!story) return;

    const phi = Math.max(0.2, Math.min(Math.PI - 0.2, (90 - story.coordinates.lat) * (Math.PI / 180)));
    const theta = (story.coordinates.lng + 180) * (Math.PI / 180);

    _targetCamPos.setFromSphericalCoords(6.0, phi, theta);
    cameraTargetPosRef.current = _targetCamPos.clone();
    isTransitioningCameraRef.current = true;
  }, [focusedStoryId]);

  // When stories are illuminated via Motif Lens, zoom out a little for context but keep looking at the
  // same spot. (Re-centring on an average of the stories sent the globe somewhere else.)
  useEffect(() => {
    if (highlightedStoryIds.length === 0 || !cameraRef.current) return;
    const base =
      isTransitioningCameraRef.current && cameraTargetPosRef.current
        ? cameraTargetPosRef.current
        : cameraRef.current.position;
    cameraTargetPosRef.current = base.clone().normalize().multiplyScalar(6.8);
    isTransitioningCameraRef.current = true;
  }, [highlightedStoryIds]);

  // When a Golden Thread connection is active, smoothly frame the arc midpoint
  useEffect(() => {
    if (!activeConnection) return;
    const storyA = STORIES.find((s) => s.id === activeConnection.from);
    const storyB = STORIES.find((s) => s.id === activeConnection.to);
    if (!storyA || !storyB) return;

    // Midpoint on the sphere (average of the two unit vectors), so a pair that straddles the
    // date line is framed on the near side instead of the opposite side of the globe.
    const toVec = (lat: number, lng: number) =>
      new THREE.Vector3().setFromSphericalCoords(
        1,
        (90 - lat) * (Math.PI / 180),
        (lng + 180) * (Math.PI / 180)
      );
    const mid = toVec(storyA.coordinates.lat, storyA.coordinates.lng).add(
      toVec(storyB.coordinates.lat, storyB.coordinates.lng)
    );
    if (mid.lengthSq() < 1e-6) mid.copy(toVec(storyA.coordinates.lat, storyA.coordinates.lng));
    cameraTargetPosRef.current = mid.normalize().multiplyScalar(5.8);
    isTransitioningCameraRef.current = true;
  }, [activeConnection]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software GL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x070c16, 0.035);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    cameraRef.current = camera;
    camera.position.setFromSphericalCoords(sphericalRef.current.radius, sphericalRef.current.phi, sphericalRef.current.theta);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true
    });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // --- CELESTIAL BACKGROUND & MINIMAL STAR DOME ---
    const starGeo = new THREE.SphereGeometry(35, 32, 32);
    const starTex = generateCelestialStarTexture();
    const starMat = new THREE.MeshBasicMaterial({
      map: starTex,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.95
    });
    const starDome = new THREE.Mesh(starGeo, starMat);
    scene.add(starDome);

    // --- REALISTIC CELESTIAL LIGHTING RIG ---
    // Warm key sunlight illuminating continents and oceans
    const keyRimLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyRimLight.position.set(7, 8, 8);
    scene.add(keyRimLight);

    // Subtle antique golden rim light on the crescent silhouette
    const sideRimLight = new THREE.DirectionalLight(0xd6b36b, 1.8);
    sideRimLight.position.set(-8, 3, -4);
    scene.add(sideRimLight);

    // Luminous ambient celestial fill so green/brown landmasses and deep ocean blues are vibrant
    const ambientLight = new THREE.AmbientLight(0x28384a, 1.25);
    scene.add(ambientLight);

    // Soft bottom water/ground glow reflection
    const groundReflectLight = new THREE.DirectionalLight(0xd6b36b, 0.45);
    groundReflectLight.position.set(0, -10, 2);
    scene.add(groundReflectLight);

    // --- MAIN GLOBE GROUP ---
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // 1. Geographically Accurate, Physically Convincing 3D Earth
    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const { map: earthMap, bumpMap: earthBump } = loadRealisticEarthTextures(() => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    });
    const globeMat = new THREE.MeshStandardMaterial({
      map: earthMap,
      bumpMap: earthBump,
      bumpScale: 0.038,
      roughness: 0.65,
      metalness: 0.08
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 2. Real Country Borders from Natural Earth GeoJSON
    let countryBordersMesh: THREE.LineSegments | null = null;
    loadCountryBorders(GLOBE_RADIUS).then((borders) => {
      if (borders && globeGroupRef.current) {
        countryBordersMesh = borders;
        globeGroupRef.current.add(borders);
      }
    });

    // 3. Realistic Rayleigh Atmosphere Scattering & Celestial Rim
    const atmosphere = createAtmosphereMesh(GLOBE_RADIUS);
    globeGroup.add(atmosphere);

    // 4. Subtle outer celestial mist ring
    const mistGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.02, GLOBE_RADIUS * 1.35, 64);
    const mistMat = new THREE.MeshBasicMaterial({
      color: 0xd6b36b,
      transparent: true,
      opacity: 0.03,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const mistRing = new THREE.Mesh(mistGeo, mistMat);
    mistRing.rotation.x = Math.PI / 2;
    globeGroup.add(mistRing);

    // --- STORY MARKERS GROUP ---
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    globeGroup.add(markersGroup);

    // --- ARCS GROUP (Golden Threads) ---
    const arcsGroup = new THREE.Group();
    arcsGroupRef.current = arcsGroup;
    globeGroup.add(arcsGroup);

    // Animation & Resize Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const tick = () => {
      const elapsed = clock.getElapsedTime();

      // Slow celestial auto-rotation only on startup when user is idle and no story has been selected
      if (allowAutoRotateRef.current && !isUserInteractingRef.current && !isTransitioningCameraRef.current && !isStoryPanelOpen) {
        sphericalRef.current.theta += 0.001;
        sphericalRef.current.theta %= Math.PI * 2;
        camera.position.setFromSphericalCoords(
          sphericalRef.current.radius,
          sphericalRef.current.phi,
          sphericalRef.current.theta
        );
        camera.lookAt(0, 0, 0);
      }

      // Smooth camera interpolation toward target position
      if (isTransitioningCameraRef.current && cameraTargetPosRef.current) {
        camera.position.lerp(cameraTargetPosRef.current, 0.06);
        camera.lookAt(0, 0, 0);

        _vec3.copy(camera.position);
        sphericalRef.current.radius = _vec3.length();
        sphericalRef.current.phi = Math.acos(Math.max(-1, Math.min(1, _vec3.y / sphericalRef.current.radius)));
        // three.js spherical coords: x = r sin(phi) sin(theta), z = r sin(phi) cos(theta)
        sphericalRef.current.theta = Math.atan2(_vec3.x, _vec3.z);

        if (camera.position.distanceTo(cameraTargetPosRef.current) < 0.04) {
          isTransitioningCameraRef.current = false;
        }
      }

      // Animate floating rings on story markers
      markersGroup.children.forEach((markerObj) => {
        const ring = markerObj.getObjectByName('pulseRing');
        if (ring) {
          const s = 1 + 0.15 * Math.sin(elapsed * 3.5 + markerObj.id);
          ring.scale.set(s, s, s);
        }
        const ripple = markerObj.getObjectByName('rippleRing');
        if (ripple) {
          const rs = 1 + 0.22 * Math.sin(elapsed * 4.5 + markerObj.id * 1.5);
          ripple.scale.set(rs, rs, rs);
        }
      });

      // Slowly rotate star dome
      starDome.rotation.y += 0.0001;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      starGeo.dispose();
      starMat.dispose();
      starTex.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      earthMap.dispose();
      earthBump.dispose();
      if (countryBordersMesh) {
        countryBordersMesh.geometry.dispose();
        if (Array.isArray(countryBordersMesh.material)) {
          countryBordersMesh.material.forEach((m) => m.dispose());
        } else {
          countryBordersMesh.material.dispose();
        }
      }
      atmosphere.children.forEach((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry?.dispose();
          c.material?.dispose();
        }
      });
      mistGeo.dispose();
      mistMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Story Markers on the globe (Small glowing beacons matching reference 1 & 3)
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    if (!markersGroup) return;

    // Clear existing markers
    while (markersGroup.children.length > 0) {
      const child = markersGroup.children[0];
      markersGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material?.dispose();
      }
    }

    STORIES.forEach((story) => {
      const pos = latLngToVector3(story.coordinates.lat, story.coordinates.lng, GLOBE_RADIUS);
      const isSelected = story.id === selectedStoryId;
      const isHighlighted = highlightedStoryIds.includes(story.id);
      const isLensActive = highlightedStoryIds.length > 0;
      const isUnrelated = isLensActive && !isSelected && !isHighlighted;

      const markerParent = new THREE.Group();
      markerParent.position.copy(pos);
      markerParent.lookAt(pos.clone().multiplyScalar(2));
      markerParent.userData = { storyId: story.id, story };

      // Small radiant core gem (Reference 1 & 3: refined glowing point of celestial light)
      const beaconGeo = new THREE.SphereGeometry(isHighlighted ? 0.07 : isSelected ? 0.065 : 0.045, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: isHighlighted ? 0xfff9ea : isSelected ? 0xfff7d0 : 0xffd97d,
        transparent: isUnrelated,
        opacity: isUnrelated ? 0.20 : 1.0
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.name = 'beacon';
      markerParent.add(beaconMesh);

      // Fine concentric glowing halo ring
      const ringGeo = new THREE.RingGeometry(0.08, isHighlighted ? 0.13 : 0.11, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isHighlighted ? 0xffe280 : isSelected ? 0xfff7e8 : 0xd6b36b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isUnrelated ? 0.15 : isHighlighted ? 1.0 : isSelected ? 0.85 : 0.45,
        blending: THREE.AdditiveBlending
      });
      const pulseRing = new THREE.Mesh(ringGeo, ringMat);
      pulseRing.name = 'pulseRing';
      pulseRing.position.z = 0.02;
      markerParent.add(pulseRing);

      // Outer luminous ripple ring for illuminated stories matching the Motif Lens
      if (isHighlighted) {
        const rippleGeo = new THREE.RingGeometry(0.16, 0.23, 28);
        const rippleMat = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending
        });
        const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
        rippleMesh.name = 'rippleRing';
        rippleMesh.position.z = 0.025;
        markerParent.add(rippleMesh);
      }

      // Invisible hit-box for smooth raycast selection
      const hitBoxGeo = new THREE.SphereGeometry(isHighlighted ? 0.35 : 0.25, 8, 8);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.userData = { storyId: story.id, story };
      markerParent.add(hitBox);

      markersGroup.add(markerParent);
    });
  }, [selectedStoryId, highlightedStoryIds]);

  // Update Golden Arcs (Connections between stories - Matching Reference Image 3)
  useEffect(() => {
    const arcsGroup = arcsGroupRef.current;
    if (!arcsGroup) return;

    // Clear previous arcs
    while (arcsGroup.children.length > 0) {
      const child = arcsGroup.children[0];
      arcsGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material?.dispose();
      }
    }

    const renderArc = (storyAId: StoryId, storyBId: StoryId, isActive: boolean) => {
      const storyA = STORIES.find((s) => s.id === storyAId);
      const storyB = STORIES.find((s) => s.id === storyBId);
      if (!storyA || !storyB) return;

      const vStart = latLngToVector3(storyA.coordinates.lat, storyA.coordinates.lng, GLOBE_RADIUS);
      const vEnd = latLngToVector3(storyB.coordinates.lat, storyB.coordinates.lng, GLOBE_RADIUS);

      const curve = createArcCurve(vStart, vEnd, GLOBE_RADIUS, 0.38);

      // 1. Glowing central thread tube (Reference Image 3)
      const tubeGeo = new THREE.TubeGeometry(curve, 48, isActive ? 0.022 : 0.015, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: isActive ? 0xfff7e8 : 0xd6b36b,
        transparent: true,
        opacity: isActive ? 0.95 : 0.75,
        blending: THREE.AdditiveBlending
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      arcsGroup.add(tubeMesh);

      // 2. Soft outer luminous halo tube
      const haloTubeGeo = new THREE.TubeGeometry(curve, 48, isActive ? 0.05 : 0.035, 8, false);
      const haloTubeMat = new THREE.MeshBasicMaterial({
        color: 0xd6b36b,
        transparent: true,
        opacity: isActive ? 0.45 : 0.22,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloTubeGeo, haloTubeMat);
      arcsGroup.add(haloMesh);

      // 3. Glowing stardust nodes along the curve
      const particleCount = 10;
      const partGeo = new THREE.SphereGeometry(isActive ? 0.026 : 0.018, 8, 8);
      const partMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending
      });
      for (let i = 1; i < particleCount; i++) {
        const u = i / particleCount;
        const pt = curve.getPoint(u);
        const pMesh = new THREE.Mesh(partGeo, partMat);
        pMesh.position.copy(pt);
        arcsGroup.add(pMesh);
      }
    };

    // Draw all completed connections
    completedConnections.forEach((conn) => {
      renderArc(conn.storyA, conn.storyB, false);
    });

    // Draw active animated connection
    if (activeConnection) {
      renderArc(activeConnection.from, activeConnection.to, true);
    }
  }, [completedConnections, activeConnection]);

  // Pointer Interaction Handlers (Supporting touch drag rotate & two-finger pinch-to-zoom)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    allowAutoRotateRef.current = false; // Never auto-rotate after user touches or clicks
    isTransitioningCameraRef.current = false; // Immediately give user full control over rotation
    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    if (activePointersRef.current.size === 1) {
      isUserInteractingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    } else if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      prevPinchDistanceRef.current = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    }

    // Two-finger pinch-to-zoom on touch screens
    if (activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
      if (prevPinchDistanceRef.current !== null && prevPinchDistanceRef.current > 0) {
        const pinchDelta = (prevPinchDistanceRef.current - dist) * 0.012;
        sphericalRef.current.radius = Math.max(3.8, Math.min(10.5, sphericalRef.current.radius + pinchDelta));
        camera.position.setFromSphericalCoords(
          sphericalRef.current.radius,
          sphericalRef.current.phi,
          sphericalRef.current.theta
        );
        camera.lookAt(0, 0, 0);
        isTransitioningCameraRef.current = false;
      }
      prevPinchDistanceRef.current = dist;
      return;
    }

    const rect = container.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

    // Raycast for story marker hover tooltips
    if (markersGroupRef.current) {
      _raycaster.setFromCamera(_mouse, camera);
      const intersects = _raycaster.intersectObjects(markersGroupRef.current.children, true);
      const hit = intersects.find((i) => i.object.userData?.story);
      if (hit && hit.object.userData.story) {
        setHoveredStory({
          story: hit.object.userData.story,
          x: e.clientX,
          y: e.clientY
        });
        container.style.cursor = 'pointer';
      } else {
        setHoveredStory(null);
        container.style.cursor = isUserInteractingRef.current ? 'grabbing' : 'grab';
      }
    }

    // Drag to rotate globe
    if (isUserInteractingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      const rotateSpeed = 0.0055;
      sphericalRef.current.theta -= deltaX * rotateSpeed;
      sphericalRef.current.phi -= deltaY * rotateSpeed;
      sphericalRef.current.phi = Math.max(0.15, Math.min(Math.PI - 0.15, sphericalRef.current.phi));

      camera.position.setFromSphericalCoords(
        sphericalRef.current.radius,
        sphericalRef.current.phi,
        sphericalRef.current.theta
      );
      camera.lookAt(0, 0, 0);
      isTransitioningCameraRef.current = false;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      prevPinchDistanceRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      isUserInteractingRef.current = false;
    }
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    allowAutoRotateRef.current = false;
    const camera = cameraRef.current;
    if (!camera) return;

    const zoomSpeed = 0.003;
    sphericalRef.current.radius += e.deltaY * zoomSpeed;
    sphericalRef.current.radius = Math.max(3.8, Math.min(10.5, sphericalRef.current.radius));

    camera.position.setFromSphericalCoords(
      sphericalRef.current.radius,
      sphericalRef.current.phi,
      sphericalRef.current.theta
    );
    camera.lookAt(0, 0, 0);
    isTransitioningCameraRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    allowAutoRotateRef.current = false;
    const container = mountRef.current;
    const camera = cameraRef.current;
    const markersGroup = markersGroupRef.current;
    if (!container || !camera || !markersGroup) return;

    const rect = container.getBoundingClientRect();
    _mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    _mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

    _raycaster.setFromCamera(_mouse, camera);
    const intersects = _raycaster.intersectObjects(markersGroup.children, true);
    const hit = intersects.find((i) => i.object.userData?.storyId);

    if (hit) {
      playGentleClick();
      const storyId = hit.object.userData.storyId as StoryId;
      onSelectStory(storyId);
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      {/* Atmospheric Vignette Overlays matching reference 1 */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-[#0B1424]/20 to-[#070C16]/90" />

      {/* Antique Floating Hover Tooltip */}
      {hoveredStory && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2 rounded-lg bg-[#0F1829]/95 border border-[#D6B36B]/60 shadow-2xl text-center backdrop-blur-xs transition-opacity duration-150"
          style={{ left: hoveredStory.x, top: hoveredStory.y - 14 }}
        >
          <div className="text-[10px] font-sans tracking-widest uppercase text-[#D6B36B] font-medium">
            {hoveredStory.story.country}
          </div>
          <div className="text-sm font-serif font-semibold text-[#FFF7E8] whitespace-nowrap">
            {hoveredStory.story.title}
          </div>
          {highlightedStoryIds.includes(hoveredStory.story.id) && (
            <div className="text-[11px] text-[#FFD97D] mt-0.5 tracking-wider font-sans font-medium">
              ✦ Click to weave Golden Thread
            </div>
          )}
        </div>
      )}
    </div>
  );
};
