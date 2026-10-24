import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export interface ThreatVector {
  id: string;
  name: string;
  type: 'phish' | 'typo' | 'impr' | 'rogu' | 'leak' | 'bots';
  severity: 'critical' | 'high' | 'medium';
  originCity: string;
  originCountry: string;
  originLat: number;
  originLng: number;
  targetCity: string;
  targetCountry: string;
  targetLat: number;
  targetLng: number;
  targetAsset: string;
  riskScore: number;
  status: 'BLOCKED' | 'MITIGATING' | 'DETECTED' | 'TAKEDOWN_SENT';
  timestamp: string;
}

interface CyberGlobe3DProps {
  className?: string;
  threats: ThreatVector[];
  activeLayers: Record<string, boolean>;
  selectedThreatId?: string | null;
  onSelectThreat?: (threat: ThreatVector) => void;
  isSoundEnabled?: boolean;
  isAutoRotate?: boolean;
  onCameraResetRef?: React.MutableRefObject<(() => void) | null>;
}

// Convert Lat / Lng to 3D Cartesian coordinates on sphere of radius R
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Color palette mapping matching Video 1 Matrix Emerald Green HUD
export const LAYER_COLORS: Record<string, number> = {
  phish: 0x00ffa3, // Neon Matrix Emerald
  typo: 0x00e88f,  // Core Emerald
  impr: 0x00e5ff,  // Cyber Mint / Cyan
  rogu: 0x10b981,  // Deep Emerald
  leak: 0x00ffa3,  // Bright Phosphor Emerald
  bots: 0x00e5ff,  // Mint Laser
};

export const LAYER_HEX: Record<string, string> = {
  phish: '#00FFA3',
  typo: '#00E88F',
  impr: '#00E5FF',
  rogu: '#10B981',
  leak: '#00FFA3',
  bots: '#00E5FF',
};

// Web Audio API Synthesizer for high-tech cyber pings
class CyberAudioSynth {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playLaserPing(type: string) {
    try {
      if (!this.ctx) this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqMap: Record<string, number> = {
        phish: 880,
        typo: 740,
        impr: 660,
        rogu: 520,
        leak: 980,
        bots: 440,
      };

      const startFreq = freqMap[type] || 600;
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 0.5, now + 0.12);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

const audioSynth = new CyberAudioSynth();

export const CyberGlobe3D: React.FC<CyberGlobe3DProps> = ({
  className = 'w-full h-full min-h-[460px]',
  threats,
  activeLayers,
  selectedThreatId,
  onSelectThreat,
  isSoundEnabled = false,
  isAutoRotate = true,
  onCameraResetRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [hoveredThreat, setHoveredThreat] = useState<ThreatVector | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // References to active Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const targetCamRotRef = useRef<{ lat: number; lng: number } | null>(null);

  // Expose camera reset to parent
  useEffect(() => {
    if (onCameraResetRef) {
      onCameraResetRef.current = () => {
        if (globeGroupRef.current) {
          globeGroupRef.current.rotation.set(0.2, 0, 0);
        }
        if (cameraRef.current) {
          cameraRef.current.position.set(0, 4, 18);
        }
      };
    }
  }, [onCameraResetRef]);

  // Smoothly rotate globe to focus on selected threat
  useEffect(() => {
    if (!selectedThreatId || !globeGroupRef.current) return;
    const threat = threats.find((t) => t.id === selectedThreatId);
    if (!threat) return;

    // Calculate target rotation to bring coordinates to front view
    const targetLngRad = -((threat.originLng + 180) * (Math.PI / 180)) + Math.PI / 2;
    const targetLatRad = (threat.originLat) * (Math.PI / 180);

    targetCamRotRef.current = {
      lat: targetLatRad * 0.5,
      lng: targetLngRad,
    };
  }, [selectedThreatId, threats]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    let isDisposed = false;
    let animId: number;

    // 1. Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 18);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Globe Master Pivot Group
    const globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.25;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const GLOBE_RADIUS = 6.2;

    // 3. Dark Earth Core Sphere (Cosmic Void Ocean)
    const oceanGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.05, 48, 48);
    const oceanMat = new THREE.MeshBasicMaterial({
      color: 0x00050B,
      transparent: true,
      opacity: 0.96,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    globeGroup.add(oceanMesh);

    // 4. Subtle Wireframe Latitude/Longitude Grid
    const wireGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 20);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ffa3,
      wireframe: true,
      transparent: true,
      opacity: 0.09,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 5. Atmospheric Fresnel Rim Glow (Video 1 Matrix Emerald Hologram)
    const haloGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 32, 32);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.0, 1.0, 0.64, 1.0) * intensity * 0.55;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    globeGroup.add(haloMesh);

    // 6. High-Density Realistic Continents Particle Grid
    // Mapped accurately across the globe using geographical regional bounds
    const continentPoints: THREE.Vector3[] = [];
    const continentRegions = [
      // North America
      { minLat: 18, maxLat: 68, minLng: -130, maxLng: -65, count: 420 },
      // South America
      { minLat: -52, maxLat: 12, minLng: -78, maxLng: -38, count: 280 },
      // Europe
      { minLat: 36, maxLat: 65, minLng: -10, maxLng: 38, count: 380 },
      // Africa
      { minLat: -34, maxLat: 35, minLng: -16, maxLng: 48, count: 390 },
      // Asia & Middle East
      { minLat: 8, maxLat: 70, minLng: 40, maxLng: 142, count: 680 },
      // Australia & New Zealand
      { minLat: -42, maxLat: -12, minLng: 114, maxLng: 154, count: 180 },
      // Japan & UK & Islands
      { minLat: 30, maxLat: 45, minLng: 129, maxLng: 145, count: 90 },
      { minLat: 50, maxLat: 59, minLng: -6, maxLng: 2, count: 60 },
    ];

    continentRegions.forEach((reg) => {
      for (let i = 0; i < reg.count; i++) {
        const lat = reg.minLat + Math.random() * (reg.maxLat - reg.minLat);
        const lng = reg.minLng + Math.random() * (reg.maxLng - reg.minLng);
        continentPoints.push(latLngToVector3(lat, lng, GLOBE_RADIUS + 0.02));
      }
    });

    const continentGeo = new THREE.BufferGeometry().setFromPoints(continentPoints);
    const continentMat = new THREE.PointsMaterial({
      color: 0x00ffa3, // Video 1 signature Matrix Emerald neon
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const continentCloud = new THREE.Points(continentGeo, continentMat);
    globeGroup.add(continentCloud);

    // 7. Dynamic 3D Parabolic Bezier Attack Arcs & Pulse Photons
    const attackGroup = new THREE.Group();
    globeGroup.add(attackGroup);

    interface AttackArcData {
      threat: ThreatVector;
      curve: THREE.QuadraticBezierCurve3;
      arcLine: THREE.Line;
      photonMesh: THREE.Mesh;
      rippleMesh: THREE.Mesh;
      speed: number;
      offset: number;
      lastProgress: number;
    }

    const attackArcs: AttackArcData[] = [];

    // Filter threats based on activeLayers
    const visibleThreats = threats.filter((t) => activeLayers[t.type] !== false);

    visibleThreats.forEach((t, idx) => {
      const pStart = latLngToVector3(t.originLat, t.originLng, GLOBE_RADIUS + 0.04);
      const pEnd = latLngToVector3(t.targetLat, t.targetLng, GLOBE_RADIUS + 0.04);

      // Midpoint projected outward to form a 3D parabolic arc
      const mid = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
      const distance = pStart.distanceTo(pEnd);
      const arcHeight = GLOBE_RADIUS * (0.25 + distance * 0.07);
      const controlPoint = mid.normalize().multiplyScalar(GLOBE_RADIUS + arcHeight);

      const curve = new THREE.QuadraticBezierCurve3(pStart, controlPoint, pEnd);
      const points = curve.getPoints(36);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const colorHex = LAYER_COLORS[t.type] || 0x00e5ff;

      const lineMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
      });
      const arcLine = new THREE.Line(lineGeo, lineMat);
      attackGroup.add(arcLine);

      // Moving photon laser projectile
      const photonGeo = new THREE.SphereGeometry(0.14, 12, 12);
      const photonMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        blending: THREE.AdditiveBlending,
      });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      photonMesh.position.copy(pStart);
      attackGroup.add(photonMesh);

      // Target impact ripple ring (shockwave)
      const rippleGeo = new THREE.RingGeometry(0.1, 0.22, 24);
      const rippleMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
      rippleMesh.position.copy(pEnd);
      rippleMesh.lookAt(pEnd.clone().multiplyScalar(2));
      attackGroup.add(rippleMesh);

      // Origin Beacon Pin
      const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
      const pinMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        blending: THREE.AdditiveBlending,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pStart.clone().multiplyScalar(1.05));
      pinMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pStart.clone().normalize());
      attackGroup.add(pinMesh);

      attackArcs.push({
        threat: t,
        curve,
        arcLine,
        photonMesh,
        rippleMesh,
        speed: 0.35 + (idx % 4) * 0.08,
        offset: (idx * 0.17) % 1.0,
        lastProgress: 0,
      });
    });

    // 8. Interactive Orbit & Drag Physics with Inertia Damping
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let velX = 0;
    let velY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      velX = 0;
      velY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDragging) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;

        velX = deltaX * 0.005;
        velY = deltaY * 0.005;

        globeGroup.rotation.y += velX;
        globeGroup.rotation.x += velY;

        // Cancel target flyTo rotation if user manual drags
        targetCamRotRef.current = null;
      }

      // Raycasting to find threat under cursor for HUD Tooltip
      const normX = (mouseX / width) * 2 - 1;
      const normY = -(mouseY / height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);

      // Check intersection with photon meshes
      const interactiveTargets = attackArcs.map((a) => a.photonMesh);
      const intersects = raycaster.intersectObjects(interactiveTargets);

      if (intersects.length > 0) {
        const hit = attackArcs.find((a) => a.photonMesh === intersects[0].object);
        if (hit) {
          setHoveredThreat(hit.threat);
          setTooltipPos({ x: mouseX + 15, y: mouseY - 25 });
          container.style.cursor = 'pointer';
          return;
        }
      }

      setHoveredThreat(null);
      container.style.cursor = isDragging ? 'grabbing' : 'grab';
    };

    const onPointerUp = () => {
      isDragging = false;
      container.style.cursor = 'grab';
    };

    // Mouse Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.015;
      camera.position.z = Math.max(10, Math.min(camera.position.z, 28));
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    // 10. 60 FPS Render Loop
    const clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Camera lerp when focusing on a threat
      if (targetCamRotRef.current) {
        globeGroup.rotation.y += (targetCamRotRef.current.lng - globeGroup.rotation.y) * 0.05;
        globeGroup.rotation.x += (targetCamRotRef.current.lat - globeGroup.rotation.x) * 0.05;
        if (
          Math.abs(targetCamRotRef.current.lng - globeGroup.rotation.y) < 0.01 &&
          Math.abs(targetCamRotRef.current.lat - globeGroup.rotation.x) < 0.01
        ) {
          targetCamRotRef.current = null;
        }
      } else if (!isDragging) {
        // Inertia damping
        velX *= 0.94;
        velY *= 0.94;
        globeGroup.rotation.y += velX;
        globeGroup.rotation.x += velY;

        // Auto-rotation when idle
        if (isAutoRotate && Math.abs(velX) < 0.0001) {
          globeGroup.rotation.y += 0.0022;
        }
      }

      // Animate Attack Arcs & Photons
      attackArcs.forEach((arc) => {
        const rawProgress = (elapsedTime * arc.speed + arc.offset) % 1.0;
        const pos = arc.curve.getPoint(rawProgress);
        arc.photonMesh.position.copy(pos);

        // Attack landing shockwave
        if (rawProgress < arc.lastProgress) {
          // Wrapped around -> photon reached target destination!
          arc.rippleMesh.scale.set(1, 1, 1);
          (arc.rippleMesh.material as THREE.MeshBasicMaterial).opacity = 0.85;

          if (isSoundEnabled) {
            audioSynth.playLaserPing(arc.threat.type);
          }
        }

        // Fade & expand ripple shockwave
        const rippleMat = arc.rippleMesh.material as THREE.MeshBasicMaterial;
        if (rippleMat.opacity > 0.01) {
          arc.rippleMesh.scale.multiplyScalar(1.05);
          rippleMat.opacity *= 0.92;
        }

        arc.lastProgress = rawProgress;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup on Unmount
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();

      // Geometry & Material Disposals
      oceanGeo.dispose();
      oceanMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      continentGeo.dispose();
      continentMat.dispose();

      attackArcs.forEach((a) => {
        a.arcLine.geometry.dispose();
        (a.arcLine.material as THREE.Material).dispose();
        a.photonMesh.geometry.dispose();
        (a.photonMesh.material as THREE.Material).dispose();
        a.rippleMesh.geometry.dispose();
        (a.rippleMesh.material as THREE.Material).dispose();
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [threats, activeLayers, isSoundEnabled, isAutoRotate]);

  return (
    <div className={`relative ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        style={{ touchAction: 'none' }}
      />

      {/* Floating Hover Crosshair Tooltip */}
      {hoveredThreat && tooltipPos && (
        <div
          className="pointer-events-none absolute z-50 p-3 rounded-xl bg-[#020713]/95 border border-[#00E5FF]/40 text-xs shadow-2xl backdrop-blur-xl space-y-1 transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ backgroundColor: LAYER_HEX[hoveredThreat.type] || '#00E5FF' }}
            />
            <span className="font-mono text-[10px] uppercase font-bold text-[#00E5FF]">
              [{hoveredThreat.type}] INBOUND ATTACK
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              {hoveredThreat.riskScore}% RISK
            </span>
          </div>

          <div className="text-white font-bold text-xs truncate max-w-[200px]">
            {hoveredThreat.targetAsset}
          </div>

          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between gap-4">
            <span>FROM: {hoveredThreat.originCity}, {hoveredThreat.originCountry}</span>
            <span className="text-[#00FFA3] font-bold">{hoveredThreat.status}</span>
          </div>
        </div>
      )}
    </div>
  );
};
