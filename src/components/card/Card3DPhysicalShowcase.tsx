import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Patient, HealthCard, Membership, CompanyProfile, CardMaterial } from '../../types';
import { CR80CardFront } from './CR80CardFront';
import { CR80CardBack } from './CR80CardBack';
import { Button } from '../common/Button';
import {
  Rotate3d,
  RotateCw,
  Sparkles,
  Layers,
  Eye,
  Sliders,
  ShieldCheck,
  Zap,
  Maximize2,
  RefreshCcw,
  Play,
  Pause
} from 'lucide-react';

interface Card3DPhysicalShowcaseProps {
  patient: Patient;
  card: HealthCard;
  membership: Membership;
  company: CompanyProfile;
  className?: string;
}

export const Card3DPhysicalShowcase: React.FC<Card3DPhysicalShowcaseProps> = ({
  patient,
  card,
  membership,
  company,
  className = ''
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [material, setMaterial] = useState<CardMaterial>(card.designConfig?.material || 'gloss');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [lightingIntensity, setLightingIntensity] = useState(80);
  const [tiltSensitivity, setTiltSensitivity] = useState(20);

  const containerRef = useRef<HTMLDivElement>(null);

  // Framer Motion 3D Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 180, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltSensitivity, -tiltSensitivity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltSensitivity, tiltSensitivity]), springConfig);

  // Light flare specular reflection position
  const flareX = useTransform(mouseX, [-0.5, 0.5], ['10%', '90%']);
  const flareY = useTransform(mouseY, [-0.5, 0.5], ['10%', '90%']);

  // Auto Rotation Loop
  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;

    if (isAutoRotating) {
      const animate = () => {
        angle += 0.02;
        mouseX.set(Math.sin(angle) * 0.4);
        mouseY.set(Math.cos(angle * 0.7) * 0.25);
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    } else {
      mouseX.set(0);
      mouseY.set(0);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoRotating, mouseX, mouseY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAutoRotating || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (!isAutoRotating) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const resetOrientation = () => {
    setIsAutoRotating(false);
    mouseX.set(0);
    mouseY.set(0);
    setIsFlipped(false);
  };

  // Material Specular Texture Styles
  const getMaterialOverlay = () => {
    switch (material) {
      case 'matte':
        return 'bg-gradient-to-tr from-white/5 via-transparent to-white/10 mix-blend-soft-light backdrop-contrast-95';
      case 'metallic':
        return 'bg-gradient-to-r from-amber-500/10 via-yellow-200/20 to-amber-600/10 mix-blend-color-dodge backdrop-brightness-110';
      case 'hologram':
        return 'bg-gradient-to-br from-red-500/20 via-green-500/20 to-blue-500/20 mix-blend-overlay backdrop-hue-rotate-90 animate-pulse';
      case 'gloss':
      default:
        return 'bg-gradient-to-tr from-white/20 via-transparent to-white/30 mix-blend-overlay';
    }
  };

  return (
    <div className={`p-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Rotate3d className="w-5 h-5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h3 className="text-base font-black text-white">
              Interactive 3D Physical ID Card Showcase
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono bg-teal-950 text-teal-300 border border-teal-500/40">
              CR80 0.76mm PVC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Hover cursor or drag to simulate real-time physical card tilt, depth shaders, and holographic reflection.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            leftIcon={isAutoRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-teal-400" />}
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="border-slate-700 bg-slate-900 text-slate-200 font-bold"
          >
            {isAutoRotating ? 'Pause Orbit' : 'Auto 360° Orbit'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={() => setIsFlipped(!isFlipped)}
            className="bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md"
          >
            Flip to {isFlipped ? 'Front' : 'Back'}
          </Button>

          <button
            onClick={resetOrientation}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset View"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Spatial Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-96 sm:h-[440px] w-full rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border border-slate-800/80 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: 1200 }}
      >
        {/* Ambient Depth Background Glow */}
        <div className="absolute inset-0 bg-radial from-teal-500/10 via-transparent to-transparent pointer-events-none" />

        {/* 3D Physical Card Mesh with Edge Depth */}
        <motion.div
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center'
          }}
          className="relative transition-transform duration-100 ease-out"
        >
          {/* Card Physical Shadow Layer */}
          <motion.div
            style={{
              transform: 'translateZ(-40px)',
              filter: 'blur(24px)'
            }}
            className="absolute inset-0 bg-black/80 rounded-3xl"
          />

          {/* PVC Beveled Edge Thickness Simulation (0.76mm Depth Layer) */}
          <div
            style={{
              transform: 'translateZ(-2px)',
              boxShadow: '0 0 0 1.5px rgba(255,255,255,0.15), 0 8px 30px rgba(0,0,0,0.8)'
            }}
            className="absolute inset-0 rounded-2xl bg-slate-800 pointer-events-none"
          />

          {/* The Flip Container */}
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.7, type: 'spring', damping: 18, stiffness: 120 }}
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative'
            }}
            className="scale-90 sm:scale-100 origin-center"
          >
            {/* FRONT FACE (Backface Hidden) */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
              className="relative rounded-2xl overflow-hidden shadow-2xl"
            >
              <CR80CardFront
                patient={patient}
                card={card}
                membership={membership}
                company={company}
                scale={1}
              />

              {/* Real-time Material Specular Overlay */}
              <div className={`absolute inset-0 pointer-events-none ${getMaterialOverlay()}`} />

              {/* Dynamic Light Flare Following Cursor */}
              <motion.div
                style={{
                  left: flareX,
                  top: flareY,
                  opacity: lightingIntensity / 100,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute w-48 h-48 rounded-full bg-radial from-white/30 via-white/5 to-transparent pointer-events-none blur-md mix-blend-overlay"
              />

              {/* Contactless NFC Loop Indicator */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-xs">
                <Zap className="w-3 h-3 text-teal-300 animate-pulse" />
                <span className="text-[8.5px] font-mono text-teal-200 font-bold">NFC ACTIVE</span>
              </div>
            </div>

            {/* BACK FACE (Rotated 180deg with Backface Hidden) */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <CR80CardBack
                card={card}
                membership={membership}
                company={company}
                patient={patient}
                scale={1}
              />

              {/* Real-time Material Specular Overlay */}
              <div className={`absolute inset-0 pointer-events-none ${getMaterialOverlay()}`} />

              {/* Dynamic Light Flare */}
              <motion.div
                style={{
                  left: flareX,
                  top: flareY,
                  opacity: lightingIntensity / 100,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute w-48 h-48 rounded-full bg-radial from-white/30 via-white/5 to-transparent pointer-events-none blur-md mix-blend-overlay"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Physical Dimension Spec Callout Pill */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-300 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>ISO/IEC 7810 ID-1: 85.60 mm × 53.98 mm (3.370 in × 2.125 in)</span>
        </div>

        {/* Rotation Prompt */}
        <div className="absolute bottom-4 right-4 z-20 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          Tilt: 3D Spatial Vector Active
        </div>
      </div>

      {/* Material Finishes & Physics Config Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Material 1: Gloss PVC */}
        <button
          onClick={() => setMaterial('gloss')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            material === 'gloss'
              ? 'bg-teal-950/60 border-teal-400 text-teal-200 ring-2 ring-teal-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span>High-Gloss PVC</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">High-luster UV gloss coating with mirror highlights</p>
        </button>

        {/* Material 2: Matte Velvet */}
        <button
          onClick={() => setMaterial('matte')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            material === 'matte'
              ? 'bg-teal-950/60 border-teal-400 text-teal-200 ring-2 ring-teal-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span>Matte Silk Touch</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Anti-glare velvety frosted finish with soft diffusion</p>
        </button>

        {/* Material 3: Metallic Gold */}
        <button
          onClick={() => setMaterial('metallic')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            material === 'metallic'
              ? 'bg-amber-950/60 border-amber-400 text-amber-200 ring-2 ring-amber-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span>Brushed Metallic Gold</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Electroplated gold flakes with metallic grain texture</p>
        </button>

        {/* Material 4: Holographic Prism */}
        <button
          onClick={() => setMaterial('hologram')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            material === 'hologram'
              ? 'bg-purple-950/60 border-purple-400 text-purple-200 ring-2 ring-purple-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between font-bold">
            <span>Holographic Prism</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Dynamic rainbow refraction security hologram</p>
        </button>
      </div>

      {/* Lighting & Tilt Sliders */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <Sliders className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="text-slate-400 text-[11px] shrink-0">Light Flare:</span>
          <input
            type="range"
            min="20"
            max="100"
            value={lightingIntensity}
            onChange={(e) => setLightingIntensity(Number(e.target.value))}
            className="w-full accent-teal-500 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-teal-300 font-bold">{lightingIntensity}%</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <Rotate3d className="w-4 h-4 text-brand-blue shrink-0" />
          <span className="text-slate-400 text-[11px] shrink-0">Tilt Angle:</span>
          <input
            type="range"
            min="5"
            max="45"
            value={tiltSensitivity}
            onChange={(e) => setTiltSensitivity(Number(e.target.value))}
            className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-blue-300 font-bold">{tiltSensitivity}°</span>
        </div>
      </div>
    </div>
  );
};
