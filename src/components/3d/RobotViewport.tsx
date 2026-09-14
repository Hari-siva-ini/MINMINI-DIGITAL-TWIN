/**
 * MINMINI 3D Interactive Digital Twin Viewport (Three.js)
 * Implements the desktop personal care robot mechanical layout, pan-tilt neck servos,
 * differential drive wheels, HC-SR04 ultrasonic sensor beam, Pi Camera,
 * animated 4.3-inch digital face screen, and desktop environment with movable obstacle.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RobotState } from '../../types/minmini';
import { RobotStateService } from '../../services/robotState';
import { createDeskEnvironment, DeskEnvironmentHandles } from './DeskEnvironment';
import { createRobotModel, RobotModelHandles } from './RobotModel';

interface RobotViewportProps {
  robotState: RobotState;
  onCameraViewChange?: (viewName: string) => void;
  className?: string;
}

export const RobotViewport: React.FC<RobotViewportProps> = ({
  robotState,
  className = '',
  onCameraViewChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasFaceRef = useRef<HTMLCanvasElement | null>(null);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Robot Model Object references (CAD & Hardware prototype)
  const robotModelRef = useRef<RobotModelHandles | null>(null);
  const robotRootRef = useRef<THREE.Group | null>(null);
  const headServoGroupRef = useRef<THREE.Group | null>(null);
  const leftWheelMeshRef = useRef<THREE.Mesh | null>(null);
  const rightWheelMeshRef = useRef<THREE.Mesh | null>(null);
  const faceTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const ultrasonicRayRef = useRef<THREE.Line | null>(null);
  const obstacleMeshRef = useRef<THREE.Mesh | null>(null);

  // Desk environment handles
  const deskHandlesRef = useRef<DeskEnvironmentHandles | null>(null);
  const robotStateRef = useRef<RobotState>(robotState);
  robotStateRef.current = robotState;

  // Orbit control state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 1.25, theta: 0.6, phi: 1.1 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.18, 0));

  const [activeCameraMode, setActiveCameraMode] = useState<string>('perspective');
  const [showUltrasonicBeam, setShowUltrasonicBeam] = useState<boolean>(true);
  const [deskLampOn, setDeskLampOn] = useState<boolean>(true);
  const [deskLampWarm, setDeskLampWarm] = useState<boolean>(true);
  const [webglError, setWebglError] = useState<string | null>(null);

  // 1. Digital Eye & Face Texture Generator (Section 11, 12, 43, 44)
  const drawFaceCanvas = () => {
    const canvas = canvasFaceRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background of 4.3-inch touchscreen: sleek obsidian slate with subtle glow
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Subtle digital bezel grid line
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // Eye parameters
    const eyeSpacing = 110;
    const leftEyeX = w / 2 - eyeSpacing / 2;
    const rightEyeX = w / 2 + eyeSpacing / 2;
    const eyeY = h / 2 - 12;

    const emotion = robotState.emotion;
    const isBlinking = robotState.isBlinking;
    const eyeDir = robotState.eyeDirection;

    // Eye direction offset
    let offsetX = 0;
    let offsetY = 0;
    if (eyeDir === 'left') offsetX = -18;
    if (eyeDir === 'right') offsetX = 18;
    if (eyeDir === 'up') offsetY = -14;
    if (eyeDir === 'down') offsetY = 14;
    if (eyeDir === 'up_left') {
      offsetX = -14;
      offsetY = -12;
    }
    if (eyeDir === 'up_right') {
      offsetX = 14;
      offsetY = -12;
    }

    // Eye Color based on emotion / state
    let eyeColor = '#38bdf8'; // Cyan default
    let eyeGlow = '#0284c7';

    if (emotion === 'happy' || emotion === 'excited' || emotion === 'celebrating') {
      eyeColor = '#34d399'; // Emerald
      eyeGlow = '#059669';
    } else if (emotion === 'love') {
      eyeColor = '#f472b6'; // Rose
      eyeGlow = '#db2777';
    } else if (emotion === 'worried' || emotion === 'confused') {
      eyeColor = '#fbbf24'; // Amber
      eyeGlow = '#d97706';
    } else if (emotion === 'emergency' || emotion === 'error' || emotion === 'angry') {
      eyeColor = '#f87171'; // Red
      eyeGlow = '#dc2626';
    } else if (emotion === 'thinking') {
      eyeColor = '#a78bfa'; // Purple
      eyeGlow = '#7c3aed';
    } else if (emotion === 'low_battery') {
      eyeColor = '#f59e0b';
      eyeGlow = '#b45309';
    } else if (emotion === 'sleeping') {
      eyeColor = '#64748b';
      eyeGlow = '#334155';
    }

    ctx.save();
    ctx.shadowColor = eyeGlow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = eyeColor;

    // Draw Left & Right Eyebrows (Image 2: Expressive curved eyebrow arcs)
    const renderEyebrow = (cx: number, cy: number, isLeft: boolean) => {
      ctx.save();
      ctx.translate(cx + offsetX, cy + offsetY);
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (emotion === 'angry') {
        if (isLeft) {
          ctx.moveTo(-24, -42);
          ctx.lineTo(24, -30);
        } else {
          ctx.moveTo(-24, -30);
          ctx.lineTo(24, -42);
        }
      } else if (emotion === 'worried' || emotion === 'confused') {
        if (isLeft) {
          ctx.moveTo(-24, -32);
          ctx.lineTo(24, -44);
        } else {
          ctx.moveTo(-24, -44);
          ctx.lineTo(24, -32);
        }
      } else if (emotion === 'thinking') {
        const archY = isLeft ? -48 : -38;
        ctx.arc(0, archY, 22, 1.25 * Math.PI, 1.75 * Math.PI, false);
      } else if (emotion === 'surprised') {
        ctx.arc(0, -52, 24, 1.2 * Math.PI, 1.8 * Math.PI, false);
      } else {
        // Classic gentle curved eyebrow arch (Image 2)
        ctx.arc(0, -42, 22, 1.25 * Math.PI, 1.75 * Math.PI, false);
      }
      ctx.stroke();
      ctx.restore();
    };

    renderEyebrow(leftEyeX, eyeY, true);
    renderEyebrow(rightEyeX, eyeY, false);

    // Draw Left & Right Eyes
    const renderEye = (cx: number, cy: number, isLeft: boolean) => {
      ctx.save();
      ctx.translate(cx + offsetX, cy + offsetY);

      if (isBlinking || emotion === 'sleeping') {
        // Closed / sleeping eyelid line
        ctx.beginPath();
        ctx.lineWidth = 7;
        ctx.strokeStyle = eyeColor;
        ctx.lineCap = 'round';
        ctx.moveTo(-32, 0);
        ctx.quadraticCurveTo(0, 10, 32, 0);
        ctx.stroke();
      } else if (emotion === 'happy' || emotion === 'celebrating') {
        // Inverted arc happy eyes ^ ^
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.strokeStyle = eyeColor;
        ctx.lineCap = 'round';
        ctx.moveTo(-32, 10);
        ctx.quadraticCurveTo(0, -22, 32, 10);
        ctx.stroke();
      } else if (emotion === 'love') {
        // Heart eyes
        ctx.beginPath();
        const s = 1.3;
        ctx.moveTo(0, 5 * s);
        ctx.bezierCurveTo(-15 * s, -12 * s, -30 * s, 10 * s, 0, 30 * s);
        ctx.bezierCurveTo(30 * s, 10 * s, 15 * s, -12 * s, 0, 5 * s);
        ctx.fill();
      } else if (emotion === 'angry') {
        // Tilted sloped eyes
        ctx.beginPath();
        ctx.ellipse(0, 0, 34, 28, isLeft ? 0.35 : -0.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (emotion === 'surprised') {
        // Large round eyes
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.fill();
        // Pupil center highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, -8, 10, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard friendly rounded rectangular display eyes (Image 2)
        const eyeW = 54;
        const eyeH = 64;
        const radius = 22;

        ctx.beginPath();
        ctx.roundRect(-eyeW / 2, -eyeH / 2, eyeW, eyeH, radius);
        ctx.fill();

        // Catchlight reflection dot (Image 2 pupil reflection)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, -10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(10, 12, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    renderEye(leftEyeX, eyeY, true);
    renderEye(rightEyeX, eyeY, false);
    ctx.restore();

    // Draw Mouth / Audio Waveform (Image 2: Friendly curved smile)
    const mouthY = h / 2 + 56;
    ctx.save();
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';

    if (robotState.speechWaveform > 0.05) {
      // Dynamic audio waveform mouth
      ctx.beginPath();
      const waveW = 70;
      const numPoints = 8;
      ctx.moveTo(w / 2 - waveW / 2, mouthY);
      for (let i = 0; i <= numPoints; i++) {
        const x = w / 2 - waveW / 2 + (i / numPoints) * waveW;
        const amp = (robotState.speechWaveform * 22) * Math.sin((i / numPoints) * Math.PI);
        const y = mouthY + (i % 2 === 0 ? -amp : amp);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (emotion === 'happy' || emotion === 'celebrating' || emotion === 'love') {
      // Wide joyful smile
      ctx.beginPath();
      ctx.arc(w / 2, mouthY - 8, 22, 0.12 * Math.PI, 0.88 * Math.PI, false);
      ctx.stroke();
    } else if (emotion === 'sad' || emotion === 'worried') {
      // Small frown
      ctx.beginPath();
      ctx.arc(w / 2, mouthY + 14, 16, 1.2 * Math.PI, 1.8 * Math.PI, false);
      ctx.stroke();
    } else {
      // Gentle friendly smile (Standard idle expression in Image 2)
      ctx.beginPath();
      ctx.arc(w / 2, mouthY - 6, 18, 0.18 * Math.PI, 0.82 * Math.PI, false);
      ctx.stroke();
    }
    ctx.restore();

    // Top status pill (Battery + WiFi indicator on 4.3" screen)
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.fillText(`MINMINI • ${robotState.sensors.batteryPct}%`, 18, 22);

    if (faceTextureRef.current) {
      faceTextureRef.current.needsUpdate = true;
    }
  };

  // 2. Setup Three.js Scene and Procedural MINMINI Model
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create offscreen canvas for face texture
    const canvasFace = document.createElement('canvas');
    canvasFace.width = 384;
    canvasFace.height = 256;
    canvasFaceRef.current = canvasFace;

    const faceTexture = new THREE.CanvasTexture(canvasFace);
    faceTextureRef.current = faceTexture;

    // Three.js Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0c111d');
    sceneRef.current = scene;

    // Camera with size fallbacks (prevents 0x0 invisible canvas if CSS hasn't resolved yet)
    let width = container.clientWidth;
    let height = container.clientHeight;
    if ((width === 0 || height === 0) && container.parentElement) {
      width = width || container.parentElement.clientWidth || 800;
      height = height || container.parentElement.clientHeight || 520;
    }
    if (width === 0) width = 800;
    if (height === 0) height = 520;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 20);
    cameraRef.current = camera;

    // Renderer with WebGL context failure handling
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch (err) {
      setWebglError((err as Error)?.message || 'WebGL is not supported on this device.');
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // WebGL context lost / restored handling
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError('WebGL render context lost. Reloading the page will restore the 3D view.');
    };
    const handleContextRestored = () => {
      setWebglError(null);
      syncCanvasSize();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // Lighting (Section 99: Lightweight balanced lighting)
    const ambientLight = new THREE.AmbientLight('#cbd5e1', 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('#ffffff', 1.2);
    mainLight.position.set(2.5, 4.0, 3.0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    const warmDeskLight = new THREE.PointLight('#fef08a', 0.6, 3.5);
    warmDeskLight.position.set(-1.2, 1.4, -0.8);
    scene.add(warmDeskLight);

    const blueBackLight = new THREE.DirectionalLight('#38bdf8', 0.5);
    blueBackLight.position.set(-2, 1.5, -2);
    scene.add(blueBackLight);

    // Desktop Environment (Section 03-08, 98-100: Complete Engineering Workstation)
    const deskHandles = createDeskEnvironment(scene);
    deskHandlesRef.current = deskHandles;
    deskHandles.setDeskLamp(deskLampOn, deskLampWarm, 1.0);

    // Moveable Obstacle prop (Section 51: Obstacle simulation)
    const obstacleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 20);
    const obstacleMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      roughness: 0.3,
      metalness: 0.2,
    });
    const obstacleMesh = new THREE.Mesh(obstacleGeo, obstacleMat);
    obstacleMesh.position.set(0, 0.08, 0.55);
    obstacleMesh.castShadow = true;
    obstacleMesh.receiveShadow = true;
    scene.add(obstacleMesh);
    obstacleMeshRef.current = obstacleMesh;

    // Obstacle caution warning stripe rings
    const ringGeo = new THREE.TorusGeometry(0.13, 0.005, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
    const warningRing = new THREE.Mesh(ringGeo, ringMat);
    warningRing.rotation.x = Math.PI / 2;
    warningRing.position.set(0, 0.005, 0.55);
    scene.add(warningRing);

    // ==========================================
    // MINMINI ROBOT 3D MODEL (CAD & Hardware Prototype Match)
    // ==========================================
    const robotModel = createRobotModel({ faceTexture });
    robotModelRef.current = robotModel;
    scene.add(robotModel.robotRoot);
    robotRootRef.current = robotModel.robotRoot;
    headServoGroupRef.current = robotModel.headServoGroup;
    leftWheelMeshRef.current = robotModel.leftWheel as THREE.Mesh;
    rightWheelMeshRef.current = robotModel.rightWheel as THREE.Mesh;
    ultrasonicRayRef.current = robotModel.ultrasonicRay;

    // Mouse & Touch Orbit Controls handlers
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - previousMousePositionRef.current.x;
      const dy = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      cameraSphericalRef.current.theta -= dx * 0.008;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi - dy * 0.008)
      );
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        0.4,
        Math.min(3.5, cameraSphericalRef.current.radius + e.deltaY * 0.0015)
      );
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile & tablet
    let lastTouchDistance = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        lastTouchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const dx = e.touches[0].clientX - previousMousePositionRef.current.x;
        const dy = e.touches[0].clientY - previousMousePositionRef.current.y;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        cameraSphericalRef.current.theta -= dx * 0.01;
        cameraSphericalRef.current.phi = Math.max(
          0.1,
          Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi - dy * 0.01)
        );
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = lastTouchDistance - dist;
        cameraSphericalRef.current.radius = Math.max(
          0.4,
          Math.min(3.5, cameraSphericalRef.current.radius + diff * 0.005)
        );
        lastTouchDistance = dist;
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Shared canvas/camera size sync (robust against late CSS layout resolution)
    const syncCanvasSize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // One-time post-mount sync in case CSS finishes resolving after the effect runs
    const sizeSyncFrame = requestAnimationFrame(syncCanvasSize);

    // ResizeObserver for clean dynamic window adjustment
    const resizeObserver = new ResizeObserver(() => syncCanvasSize());
    resizeObserver.observe(container);

    // Animation Render Loop
    let animationFrameId: number;
    let frameCount = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      frameCount++;

      // Camera position update based on spherical coords
      const s = cameraSphericalRef.current;
      const target = cameraTargetRef.current;

      camera.position.x = target.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.y = target.y + s.radius * Math.cos(s.phi);
      camera.position.z = target.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta);
      camera.lookAt(target);

      // Update robot model transforms and dynamic LED effects
      if (robotModelRef.current) {
        robotModelRef.current.update(robotStateRef.current, elapsed);
      }

      // Update interactive desk elements (laptop telemetry, LED clock, dock charger status)
      if (deskHandlesRef.current) {
        if (frameCount % 12 === 0) {
          deskHandlesRef.current.updateLaptopScreen(robotStateRef.current);
          deskHandlesRef.current.updateDockLed(robotStateRef.current);
        }
        if (frameCount % 60 === 0) {
          deskHandlesRef.current.updateClock();
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(sizeSyncFrame);
      resizeObserver.disconnect();

      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);

      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      if (robotModelRef.current) {
        robotModelRef.current.dispose();
        robotModelRef.current = null;
      }

      if (deskHandlesRef.current) {
        deskHandlesRef.current.dispose();
        deskHandlesRef.current = null;
      }

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Sync desk lamp settings with 3D scene
  useEffect(() => {
    deskHandlesRef.current?.setDeskLamp(deskLampOn, deskLampWarm, 1.0);
  }, [deskLampOn, deskLampWarm]);

  // 3. Synchronize Three.js transforms with RobotState
  useEffect(() => {
    // Redraw 2D dynamic touchscreen canvas
    drawFaceCanvas();

    // Position, Heading, Wheels, Servos, and Sensors via RobotModel
    if (robotModelRef.current) {
      robotModelRef.current.update(robotState, 0);
    }
  }, [robotState]);

  // Camera preset modes (Section 97 & 98)
  const setCameraPreset = (mode: string) => {
    setActiveCameraMode(mode);
    if (onCameraViewChange) onCameraViewChange(mode);

    switch (mode) {
      case 'front':
        cameraSphericalRef.current = { radius: 1.0, theta: 0, phi: 1.4 };
        cameraTargetRef.current.set(robotState.odometry.x, 0.18, robotState.odometry.z);
        break;
      case 'closeup_face':
        cameraSphericalRef.current = { radius: 0.45, theta: 0, phi: 1.5 };
        cameraTargetRef.current.set(robotState.odometry.x, 0.24, robotState.odometry.z);
        break;
      case 'top_map':
        cameraSphericalRef.current = { radius: 1.6, theta: 0, phi: 0.1 };
        cameraTargetRef.current.set(0, 0, 0.2);
        break;
      case 'side':
        cameraSphericalRef.current = { radius: 1.1, theta: Math.PI / 2, phi: 1.3 };
        cameraTargetRef.current.set(robotState.odometry.x, 0.18, robotState.odometry.z);
        break;
      case 'desk_view':
        cameraSphericalRef.current = { radius: 2.1, theta: 0.72, phi: 1.02 };
        cameraTargetRef.current.set(0, 0.12, -0.05);
        break;
      case 'perspective':
      default:
        cameraSphericalRef.current = { radius: 1.25, theta: 0.55, phi: 1.15 };
        cameraTargetRef.current.set(robotState.odometry.x, 0.18, robotState.odometry.z);
        break;
    }
  };

  const handleDockRobot = () => {
    // Navigate smoothly to charger dock station
    RobotStateService.getInstance().teleportOdometry(0.58, -0.22, 180);
    RobotStateService.getInstance().setActivity('sleeping');
    RobotStateService.getInstance().setEmotion('sleeping');
    RobotStateService.getInstance().setPanTilt(0, 5);
  };

  return (
    <div className={`relative w-full h-full select-none overflow-hidden ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing">
        {webglError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6 max-w-sm">
              <p className="text-red-400 font-semibold text-sm">3D Simulation Unavailable</p>
              <p className="text-slate-400 text-xs mt-1.5">{webglError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Camera Mode Switcher (Section 97 & 98) */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 p-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 shadow-lg z-10">
        {[
          { id: 'perspective', label: 'Perspective' },
          { id: 'closeup_face', label: 'Face Display' },
          { id: 'desk_view', label: 'Workstation' },
          { id: 'front', label: 'Front View' },
          { id: 'top_map', label: 'Top Map' },
          { id: 'side', label: 'Side Profile' },
        ].map((view) => (
          <button
            key={view.id}
            id={`btn-cam-${view.id}`}
            onClick={() => setCameraPreset(view.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              activeCameraMode === view.id
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {view.label}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Desk Lamp controls in viewport */}
        <button
          id="btn-toggle-desklamp"
          onClick={() => setDeskLampOn(!deskLampOn)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
            deskLampOn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle Warm Desk Lamp"
        >
          <span>💡</span> Lamp {deskLampOn ? 'ON' : 'OFF'}
        </button>

        {deskLampOn && (
          <button
            id="btn-toggle-desklamp-color"
            onClick={() => setDeskLampWarm(!deskLampWarm)}
            className="px-2 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Warm 2700K vs Cool 5500K desk lighting"
          >
            {deskLampWarm ? '2700K Warm' : '5500K Cool'}
          </button>
        )}
      </div>

      {/* Real-time 3D Telemetry HUD Overlay */}
      <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 shadow-lg text-xs space-y-1.5 pointer-events-none z-10 min-w-[220px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-slate-400">
          <span className="font-semibold text-slate-200">MINMINI-001 TWIN</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 text-slate-300">
          <div>
            <span className="text-slate-500">Pose:</span> ({robotState.odometry.x.toFixed(2)}, {robotState.odometry.z.toFixed(2)})m
          </div>
          <div>
            <span className="text-slate-500">Heading:</span> {robotState.odometry.heading.toFixed(1)}°
          </div>
          <div>
            <span className="text-slate-500">Pan/Tilt:</span> {robotState.servo.panDeg.toFixed(0)}° / {robotState.servo.tiltDeg.toFixed(0)}°
          </div>
          <div>
            <span className="text-slate-500">Ultrasonic:</span>{' '}
            <span
              className={
                robotState.sensors.ultrasonicCm < 20
                  ? 'text-red-400 font-bold'
                  : robotState.sensors.ultrasonicCm < 40
                  ? 'text-amber-400 font-bold'
                  : 'text-sky-400'
              }
            >
              {robotState.sensors.ultrasonicCm} cm
            </span>
          </div>
        </div>
      </div>

      {/* Movable Obstacle & Quick Action Controls on 3D stage */}
      <div className="absolute top-4 right-4 flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 text-xs text-slate-300 shadow-lg z-10">
        <button
          id="btn-dock-robot"
          onClick={handleDockRobot}
          className="px-2 py-1 rounded bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-800/80 text-emerald-300 text-[11px] font-medium transition-colors flex items-center gap-1"
          title="Sends MINMINI to its desktop induction charging dock station"
        >
          <span>⚡</span> Dock at Charger
        </button>

        <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

        <span className="text-slate-400">Obstacle:</span>
        <button
          id="btn-move-obstacle-near"
          onClick={() => {
            RobotStateService.getInstance().setObstacle(0, 0.28, true);
          }}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] transition-colors"
          title="Places obstacle close (28cm) to trigger warning & stop"
        >
          Near (28cm)
        </button>
        <button
          id="btn-move-obstacle-far"
          onClick={() => {
            RobotStateService.getInstance().setObstacle(0, 0.85, true);
          }}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] transition-colors"
          title="Places obstacle at safe distance (85cm)"
        >
          Far (85cm)
        </button>
        <button
          id="btn-toggle-obstacle"
          onClick={() => {
            const obs = RobotStateService.getInstance().getObstacle();
            RobotStateService.getInstance().setObstacle(obs.x, obs.z, !obs.enabled);
          }}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
        >
          Toggle
        </button>
      </div>

      {/* Orbit Help hint */}
      <div className="absolute bottom-4 right-4 text-[11px] text-slate-400 bg-slate-900/70 px-2.5 py-1 rounded border border-slate-800 pointer-events-none">
        Drag to orbit • Scroll to zoom
      </div>
    </div>
  );
};
