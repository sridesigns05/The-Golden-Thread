import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { Compass, BookOpen, Sparkles } from 'lucide-react';
import { playParchmentRustle, playGentleClick, playGoldenThreadResonance } from '../utils/audio';
import { loadRealisticEarthTextures } from '../utils/earthGeography';

interface StorybookOnboardingProps {
  onComplete: () => void;
}

export const StorybookOnboarding: React.FC<StorybookOnboardingProps> = ({ onComplete }) => {
  // Phase: 'closed' | 'opening' | 'globe-rising' | 'zooming'
  const [phase, setPhase] = useState<'closed' | 'opening' | 'globe-rising' | 'zooming'>('closed');

  // Mini Three.js canvas ref for the miniature globe inside the book
  const miniGlobeMountRef = useRef<HTMLDivElement>(null);
  const miniGlobeSceneRef = useRef<{ renderer: THREE.WebGLRenderer; mesh: THREE.Mesh; frameId: number } | null>(null);

  // Initialize Miniature 3D Globe inside the book
  useEffect(() => {
    const container = miniGlobeMountRef.current;
    if (!container) return;

    const width = 220;
    const height = 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 4.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Warm key light & rim lighting on the miniature globe
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd6b36b, 2.0);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x2a3848, 1.4);
    scene.add(ambientLight);

    // Miniature Globe with realistic Earth texture
    const globeGeo = new THREE.SphereGeometry(1.4, 48, 48);
    const { map: globeTex, bumpMap: globeBump } = loadRealisticEarthTextures();
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTex,
      bumpMap: globeBump,
      bumpScale: 0.035,
      roughness: 0.65,
      metalness: 0.08
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);

    // Soft luminous atmosphere ring
    const atmoGeo = new THREE.SphereGeometry(1.42, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0xd6b36b,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    let frameId = 0;
    const animate = () => {
      globeMesh.rotation.y += 0.006;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    miniGlobeSceneRef.current = { renderer, mesh: globeMesh, frameId };

    return () => {
      cancelAnimationFrame(frameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      globeGeo.dispose();
      globeMat.dispose();
      globeTex.dispose();
      globeBump.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      renderer.dispose();
    };
  }, []);

  const handleOpenBook = () => {
    if (phase !== 'closed') return;
    playGentleClick();
    playParchmentRustle();
    setPhase('opening');

    // 0.65s: Cover sweeps open -> miniature globe emerges & floats up
    setTimeout(() => {
      setPhase('globe-rising');
      playGoldenThreadResonance();
    }, 650);

    // 1.55s: Camera smoothly zooms into the globe as it expands
    setTimeout(() => {
      setPhase('zooming');
    }, 1550);

    // 2.6s: Complete transition to interactive globe
    setTimeout(() => {
      onComplete();
    }, 2600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070C16] overflow-hidden select-none">
      {/* Dark mystical celestial observatory atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#13232C]/70 via-[#0B1424]/92 to-[#040810] pointer-events-none" />

      {/* Floating subtle celestial dust */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="w-1.5 h-1.5 rounded-full bg-[#D6B36B] absolute top-1/4 left-1/3 animate-ping duration-1000" />
        <div className="w-1 h-1 rounded-full bg-[#FFF7E8] absolute top-2/3 left-1/5 animate-pulse duration-700" />
        <div className="w-2 h-2 rounded-full bg-[#D6B36B] absolute top-1/3 right-1/4 animate-pulse duration-1000" />
      </div>

      {/* 3D Book Stage Container */}
      <motion.div
        className="relative z-10 w-full max-w-lg md:max-w-xl flex items-center justify-center"
        style={{ perspective: 1800 }}
        animate={
          phase === 'zooming'
            ? { scale: 3.6, opacity: 0, filter: 'blur(6px)' }
            : { scale: 1, opacity: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Soft Ambient Contact Shadow */}
        <div className="absolute -bottom-8 w-4/5 h-10 bg-black/85 rounded-full blur-xl pointer-events-none transform scale-y-50" />

        {/* The Antique Book Structure */}
        <div
          className="relative w-[320px] sm:w-[380px] md:w-[440px] h-[450px] sm:h-[500px] md:h-[530px] rounded-r-xl shadow-2xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 1. Visible Spine on Left (Ribbed Leather with Gold Bands) */}
          <div className="absolute left-[-26px] top-[-2px] bottom-[-2px] w-8 bg-gradient-to-r from-[#170C07] via-[#2A160D] to-[#1E1009] rounded-l-md border-r border-[#D6B36B]/40 flex flex-col justify-around py-10 items-center shadow-2xl z-30 pointer-events-none">
            <div className="w-5 h-1 bg-[#D6B36B]/60 shadow-xs" />
            <div className="w-5 h-1 bg-[#D6B36B]/60 shadow-xs" />
            <div className="w-5 h-1 bg-[#D6B36B]/60 shadow-xs" />
            <div className="w-5 h-1 bg-[#D6B36B]/60 shadow-xs" />
          </div>

          {/* 2. Layered Page Edges (Right and Bottom page block showing hundreds of leaves) */}
          <div
            className="absolute right-[-14px] top-3 bottom-3 w-4 rounded-r-xs shadow-md z-10 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(to right, #DFD1B1 0px, #DFD1B1 1px, #CFC09E 1px, #CFC09E 2px)',
              borderTop: '1px solid #B7A47A',
              borderBottom: '1px solid #B7A47A',
              borderRight: '1px solid #9C8961'
            }}
          />
          <div
            className="absolute left-2 right-[-14px] bottom-[-10px] h-3 rounded-b-xs shadow-md z-10 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(to bottom, #DFD1B1 0px, #DFD1B1 1px, #CFC09E 1px, #CFC09E 2px)',
              borderBottom: '1px solid #9C8961'
            }}
          />

          {/* 3. Underneath: Grounded Open Parchment Pages Revealing Floating 3D Globe */}
          <div className="absolute inset-0 rounded-r-lg bg-gradient-to-br from-[#F5EEDB] via-[#EFE4CA] to-[#E5D7B7] border border-[#C5A566] shadow-inner flex flex-col items-center justify-between p-6 overflow-hidden z-0">
            {/* Subtle central spine valley & gold corner ornamentation */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-[#D6B36B]/60 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-[#D6B36B]/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-[#D6B36B]/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-[#D6B36B]/60 pointer-events-none" />

            <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#8A6726] font-semibold text-center mt-1">
              ✦ The Celestial Globe of Tales ✦
            </div>

            {/* The Real 3D Miniature Globe Emerges from the Center Fold */}
            <motion.div
              className="relative my-auto flex items-center justify-center"
              animate={
                phase === 'globe-rising' || phase === 'zooming'
                  ? { y: -24, scale: phase === 'zooming' ? 1.6 : 1.15 }
                  : { y: 0, scale: 1 }
              }
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Luminous Golden Aura beneath the globe */}
              <div className="absolute w-36 h-36 rounded-full bg-[#D6B36B]/25 filter blur-lg pointer-events-none animate-pulse" />

              {/* Three.js Miniature Globe Canvas Container */}
              <div ref={miniGlobeMountRef} className="relative z-10 w-[220px] h-[220px] pointer-events-none" />
            </motion.div>

            <div className="text-[11px] font-serif italic text-[#19372F]/75 text-center mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D6B36B] animate-spin" />
              <span>Entering the enchanted atlas...</span>
            </div>
          </div>

          {/* 4. The Front Cover (Separately Animated around Left Spine!) */}
          <motion.div
            className="absolute inset-0 rounded-r-xl bg-gradient-to-br from-[#2C1910] via-[#381F14] to-[#1C0F08] border-2 border-[#D6B36B]/80 shadow-2xl flex flex-col justify-between p-7 sm:p-9 text-center origin-left overflow-hidden z-20 cursor-pointer"
            animate={phase === 'closed' ? { rotateY: 0 } : { rotateY: -155 }}
            transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden'
            }}
            onClick={phase === 'closed' ? handleOpenBook : undefined}
          >
            {/* Embossed Gold Filigree Border */}
            <div className="absolute inset-3 border border-[#D6B36B]/50 rounded-r-lg pointer-events-none" />
            <div className="absolute inset-4 border border-[#D6B36B]/25 rounded-r-md pointer-events-none" />

            {/* Corner Brass Clasp Ornaments */}
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#D6B36B] rounded-tr pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#D6B36B] rounded-br pointer-events-none" />

            {/* Top Emblem */}
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div className="w-9 h-9 rounded-full border border-[#D6B36B]/70 flex items-center justify-center bg-[#21120B] shadow-inner">
                <Compass className="w-4 h-4 text-[#D6B36B]" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.25em] font-sans text-[#D6B36B]/80 font-medium">
                Fairytale Museum Atlas
              </span>
            </div>

            {/* Center Embossed Title */}
            <div className="my-auto py-5 px-3 border-y border-[#D6B36B]/30 bg-[#21120B]/40 rounded-lg">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#FFF7E8] tracking-wider leading-tight drop-shadow-md">
                THE GOLDEN THREAD
              </h1>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#D6B36B] to-transparent mx-auto my-2.5" />
              <p className="text-xs sm:text-sm font-serif italic text-[#D6B36B] max-w-xs mx-auto">
                “Every story begins somewhere. Few stay there.”
              </p>
            </div>

            {/* Refined CTA Button */}
            <div className="pb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBook();
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#D6B36B] via-[#E7CCA0] to-[#D6B36B] text-[#0B1424] font-serif font-bold text-sm tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#0B1424]" />
                <span>Open the Book</span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Skip Intro Button in Bottom Right */}
      <button
        onClick={() => {
          playGentleClick();
          onComplete();
        }}
        className="fixed bottom-4 right-4 z-50 text-xs font-sans text-[#F1E5CC]/60 hover:text-[#FFF7E8] px-3 py-1.5 rounded-md hover:bg-[#101D33]/60 transition-colors cursor-pointer"
      >
        Skip Intro →
      </button>
    </div>
  );
};
