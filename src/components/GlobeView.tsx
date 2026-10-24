import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { StoryData, StoryId } from '../types';
import { STORIES } from '../data/stories';
import { latLngToVector3, createArcCurve } from '../utils/geo';
import { generateAntiqueGlobeTexture, generateCelestialStarTexture } from '../utils/antiqueGlobeTexture';
import { playGentleClick } from '../utils/audio';

// Module-scope math helpers for zero GC during animation loop
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

interface GlobeViewProps {
  selectedStoryId: StoryId | null;
  onSelectStory: (storyId: StoryId) => void;
  highlightedStoryIds: StoryId[]; // stories illuminated after motif reveal
  activeConnection: { from: StoryId; to: StoryId } | null;
  completedConnections: { storyA: StoryId; storyB: StoryId }[];
  isStoryPanelOpen: boolean;
}

export const GlobeView: React.FC<GlobeViewProps> = ({
  selectedStoryId,
  onSelectStory,
  highlightedStoryIds,
  activeConnection,
  completedConnections,
  isStoryPanelOpen
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredStory, setHoveredStory] = useState<{ story: StoryData; x: number; y: number } | null>(null);

  // References for mutable scene objects without re-triggering scene creation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);

  // Interaction & camera animation state
  const isUserInteractingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const cameraTargetPosRef = useRef<THREE.Vector3 | null>(null);
  const isTransitioningCameraRef = useRef(false);
  const sphericalRef = useRef({ radius: 6.5, theta: 0.5, phi: Math.PI / 2.3 });
  const autoRotateSpeedRef = useRef(0.0012);
  const idleTimerRef = useRef(0);

  // Globe radius constant
  const GLOBE_RADIUS = 2.4;

  // Sync camera focus when selectedStoryId changes
  useEffect(() => {
    if (!selectedStoryId) return;
    const story = STORIES.find((s) => s.id === selectedStoryId);
    if (!story) return;

    // Convert lat/lng to target camera spherical position
    // For a pleasant 3/4 perspective, aim camera slightly above the target location
    const phi = Math.max(0.2, Math.min(Math.PI - 0.2, (90 - story.coordinates.lat) * (Math.PI / 180)));
    const theta = (story.coordinates.lng + 180) * (Math.PI / 180);

    // Target spherical coordinates
    const targetRadius = 5.2; // closer zoom on selected story
    _targetCamPos.setFromSphericalCoords(targetRadius, phi, theta);

    cameraTargetPosRef.current = _targetCamPos.clone();
    isTransitioningCameraRef.current = true;
    idleTimerRef.current = 0;
  }, [selectedStoryId]);

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
    scene.fog = new THREE.FogExp2(0x0b1424, 0.04);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    cameraRef.current = camera;
    camera.position.setFromSphericalCoords(sphericalRef.current.radius, sphericalRef.current.phi, sphericalRef.current.theta);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- CELESTIAL BACKGROUND & STAR DOME ---
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

    // --- LIGHTING RIG ---
    // Warm key light (Antique Gold sunlight)
    const keyLight = new THREE.DirectionalLight(0xfff1d6, 2.2);
    keyLight.position.set(10, 8, 12);
    scene.add(keyLight);

    // Cool rim light (Midnight observatory illumination)
    const rimLight = new THREE.DirectionalLight(0x7da4d4, 1.4);
    rimLight.position.set(-10, -6, -10);
    scene.add(rimLight);

    // Soft celestial ambient
    const ambientLight = new THREE.AmbientLight(0x28384a, 0.9);
    scene.add(ambientLight);

    // --- MAIN GLOBE GROUP ---
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // 1. Globe Sphere with Antique Parchment / Midnight Ocean Map
    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const globeTex = generateAntiqueGlobeTexture();
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTex,
      roughness: 0.65,
      metalness: 0.15,
      bumpScale: 0.02
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 2. Atmospheric & Celestial Golden Sheen (Fresnel Glow)
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0xd6b36b,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 3. Antique Brass Armillary Rings
    // Meridian Ring (Vertical)
    const meridianRingGeo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.08, 0.032, 16, 100);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd6b36b,
      roughness: 0.35,
      metalness: 0.85
    });
    const meridianRing = new THREE.Mesh(meridianRingGeo, brassMat);
    meridianRing.rotation.y = Math.PI / 2;
    globeGroup.add(meridianRing);

    // Equatorial Brass Ring
    const equatorRingGeo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.12, 0.025, 16, 100);
    const equatorRing = new THREE.Mesh(equatorRingGeo, brassMat);
    equatorRing.rotation.x = Math.PI / 2;
    globeGroup.add(equatorRing);

    // Ecliptic Zodiac Band (tilted 23.5 degrees)
    const eclipticRingGeo = new THREE.TorusGeometry(GLOBE_RADIUS * 1.15, 0.022, 16, 100);
    const eclipticMat = new THREE.MeshStandardMaterial({
      color: 0xe7cca0,
      roughness: 0.3,
      metalness: 0.9
    });
    const eclipticRing = new THREE.Mesh(eclipticRingGeo, eclipticMat);
    eclipticRing.rotation.x = Math.PI / 2 + (23.5 * Math.PI) / 180;
    globeGroup.add(eclipticRing);

    // North & South Axis Finials (Decorative Brass Posts)
    const finialGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.45, 16);
    const northFinial = new THREE.Mesh(finialGeo, brassMat);
    northFinial.position.set(0, GLOBE_RADIUS * 1.12, 0);
    globeGroup.add(northFinial);

    const southFinial = northFinial.clone();
    southFinial.position.set(0, -GLOBE_RADIUS * 1.12, 0);
    southFinial.rotation.x = Math.PI;
    globeGroup.add(southFinial);

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
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slow celestial auto-rotation when user is idle
      if (!isUserInteractingRef.current && !isTransitioningCameraRef.current && !isStoryPanelOpen) {
        sphericalRef.current.theta += autoRotateSpeedRef.current;
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
        camera.position.lerp(cameraTargetPosRef.current, 0.05);
        camera.lookAt(0, 0, 0);

        // Update spherical coords from camera position
        _vec3.copy(camera.position);
        sphericalRef.current.radius = _vec3.length();
        sphericalRef.current.phi = Math.acos(Math.max(-1, Math.min(1, _vec3.y / sphericalRef.current.radius)));
        sphericalRef.current.theta = Math.atan2(_vec3.z, _vec3.x);

        if (camera.position.distanceTo(cameraTargetPosRef.current) < 0.05) {
          isTransitioningCameraRef.current = false;
        }
      }

      // Animate floating rings on story markers
      markersGroup.children.forEach((markerObj) => {
        const ring = markerObj.getObjectByName('pulseRing');
        if (ring) {
          ring.rotation.z += 0.02;
          const s = 1 + 0.12 * Math.sin(elapsed * 3 + markerObj.id);
          ring.scale.set(s, s, s);
        }
      });

      // Slowly rotate star dome for subtle observatory atmosphere
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
      globeTex.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      meridianRingGeo.dispose();
      equatorRingGeo.dispose();
      eclipticRingGeo.dispose();
      finialGeo.dispose();
      brassMat.dispose();
      eclipticMat.dispose();
      renderer.dispose();
    };
  }, [isStoryPanelOpen]);

  // Update Story Markers on the globe
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

      const markerParent = new THREE.Group();
      markerParent.position.copy(pos);
      markerParent.lookAt(pos.clone().multiplyScalar(2)); // Align perpendicular to sphere surface
      markerParent.userData = { storyId: story.id, story };

      // Base Pin Gem (Hexagonal or Spherical Beacon)
      const beaconGeo = new THREE.SphereGeometry(isSelected ? 0.095 : 0.075, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xfff7e8 : isHighlighted ? 0xffd97d : 0xd6b36b,
        emissive: isSelected ? 0xd6b36b : isHighlighted ? 0xa98336 : 0x4a3a18,
        emissiveIntensity: isSelected ? 1.4 : isHighlighted ? 1.1 : 0.4,
        roughness: 0.2,
        metalness: 0.8
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.name = 'beacon';
      markerParent.add(beaconMesh);

      // Elevated Light Shaft / Pin
      const pinGeo = new THREE.CylinderGeometry(0.012, 0.02, 0.12, 8);
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xd6b36b,
        roughness: 0.3,
        metalness: 0.9
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.z = 0.06;
      pinMesh.rotation.x = Math.PI / 2;
      markerParent.add(pinMesh);

      // Floating Illuminated Concentric Ring
      const ringGeo = new THREE.RingGeometry(0.12, 0.16, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isHighlighted ? 0xffea9f : isSelected ? 0xfff7e8 : 0xd6b36b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isHighlighted ? 0.85 : isSelected ? 0.75 : 0.35,
        blending: THREE.AdditiveBlending
      });
      const pulseRing = new THREE.Mesh(ringGeo, ringMat);
      pulseRing.name = 'pulseRing';
      pulseRing.position.z = 0.03;
      markerParent.add(pulseRing);

      // Outer ripple ring if highlighted
      if (isHighlighted) {
        const rippleGeo = new THREE.RingGeometry(0.2, 0.24, 24);
        const rippleMat = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending
        });
        const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
        rippleMesh.position.z = 0.04;
        markerParent.add(rippleMesh);
      }

      // Invisible hit-box sphere for effortless raycasting clicks
      const hitBoxGeo = new THREE.SphereGeometry(0.24, 8, 8);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.userData = { storyId: story.id, story };
      markerParent.add(hitBox);

      markersGroup.add(markerParent);
    });
  }, [selectedStoryId, highlightedStoryIds]);

  // Update Golden Arcs (Connections between stories)
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

    // Helper to render an arc between two stories
    const renderArc = (storyAId: StoryId, storyBId: StoryId, isActive: boolean) => {
      const storyA = STORIES.find((s) => s.id === storyAId);
      const storyB = STORIES.find((s) => s.id === storyBId);
      if (!storyA || !storyB) return;

      const vStart = latLngToVector3(storyA.coordinates.lat, storyA.coordinates.lng, GLOBE_RADIUS);
      const vEnd = latLngToVector3(storyB.coordinates.lat, storyB.coordinates.lng, GLOBE_RADIUS);

      const curve = createArcCurve(vStart, vEnd, GLOBE_RADIUS, 0.42);
      const points = curve.getPoints(50);

      // 1. Glowing tube mesh for the main thread
      const tubeGeo = new THREE.TubeGeometry(curve, 40, isActive ? 0.024 : 0.016, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: isActive ? 0xfff7e8 : 0xd6b36b,
        transparent: true,
        opacity: isActive ? 0.95 : 0.75,
        blending: THREE.AdditiveBlending
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      arcsGroup.add(tubeMesh);

      // 2. Outer luminous halo tube
      const haloTubeGeo = new THREE.TubeGeometry(curve, 40, isActive ? 0.055 : 0.038, 8, false);
      const haloTubeMat = new THREE.MeshBasicMaterial({
        color: 0xd6b36b,
        transparent: true,
        opacity: isActive ? 0.45 : 0.22,
        blending: THREE.AdditiveBlending
      });
      const haloMesh = new THREE.Mesh(haloTubeGeo, haloTubeMat);
      arcsGroup.add(haloMesh);

      // 3. Stardust Nodes along the curve
      const particleCount = 12;
      const partGeo = new THREE.SphereGeometry(isActive ? 0.028 : 0.02, 8, 8);
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

    // Draw all unlocked/completed connections
    completedConnections.forEach((conn) => {
      renderArc(conn.storyA, conn.storyB, false);
    });

    // Draw currently active connection highlighted
    if (activeConnection) {
      renderArc(activeConnection.from, activeConnection.to, true);
    }
  }, [completedConnections, activeConnection]);

  // Pointer Interaction Handlers (Orbit Drag, Zoom, Raycast Selection)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isUserInteractingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    if (!container || !camera) return;

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

      const rotateSpeed = 0.006;
      sphericalRef.current.theta -= deltaX * rotateSpeed;
      sphericalRef.current.phi -= deltaY * rotateSpeed;

      // Restrict phi to avoid gimbal flip
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
    isUserInteractingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture release throws
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const camera = cameraRef.current;
    if (!camera) return;

    const zoomSpeed = 0.003;
    sphericalRef.current.radius += e.deltaY * zoomSpeed;
    // Clamp zoom distance between 3.8 and 10.5
    sphericalRef.current.radius = Math.max(3.8, Math.min(10.5, sphericalRef.current.radius));

    camera.position.setFromSphericalCoords(
      sphericalRef.current.radius,
      sphericalRef.current.phi,
      sphericalRef.current.theta
    );
    camera.lookAt(0, 0, 0);
    isTransitioningCameraRef.current = false;
  };

  // Click on Story Marker
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
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

      {/* Atmospheric Vignette Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-transparent via-[#0B1424]/20 to-[#0B1424]/85" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#0B1424] to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1424] to-transparent" />

      {/* Antique Floating Hover Tooltip */}
      {hoveredStory && (
        <div
          className="fixed pointer-events-none z-40 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 rounded bg-[#101D33]/95 border border-[#D6B36B]/50 shadow-2xl text-center backdrop-blur-xs transition-opacity duration-150"
          style={{ left: hoveredStory.x, top: hoveredStory.y - 12 }}
        >
          <div className="text-[11px] font-sans tracking-widest uppercase text-[#D6B36B]/90 font-medium">
            {hoveredStory.story.country}
          </div>
          <div className="text-sm font-serif font-semibold text-[#FFF7E8] whitespace-nowrap">
            {hoveredStory.story.title}
          </div>
          {highlightedStoryIds.includes(hoveredStory.story.id) && (
            <div className="text-[10px] text-[#E7CCA0] mt-0.5 tracking-wider font-sans">
              ✦ Click to weave thread
            </div>
          )}
        </div>
      )}
    </div>
  );
};
