/**
 * MINMINI 3D Digital Twin - Desktop Environment Builder
 * Constructs a modern engineering student workstation around MINMINI:
 * Desktop surface, steel legs, floor, acoustic wall, shelf, framed concept board,
 * desk mat, laptop on aluminum stand with dynamic telemetry screen, 75% mechanical keyboard,
 * mouse, articulated desk lamp with controllable lighting, dedicated charging dock,
 * notebook with pen/pencil, smartphone, tablet, coffee mug, water bottle, plants,
 * digital clock, books, sticky notes, electronics parts organizer, and studio headphones.
 *
 * Lightweight & optimized for 6GB RAM / Integrated GPU.
 */
import * as THREE from 'three';
import { RobotState } from '../../types/minmini';

export interface DeskEnvironmentHandles {
  updateLaptopScreen: (state: RobotState) => void;
  updateClock: () => void;
  updateDockLed: (state: RobotState) => void;
  setDeskLamp: (on: boolean, warm: boolean, intensity: number) => void;
  dispose: () => void;
}

export function createDeskEnvironment(scene: THREE.Scene): DeskEnvironmentHandles {
  const disposableResources: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
  const addDisposable = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(res: T): T => {
    disposableResources.push(res);
    return res;
  };

  // Group to hold all environment objects for easy cleanup
  const envGroup = new THREE.Group();
  envGroup.name = 'DeskEnvironmentGroup';
  scene.add(envGroup);

  // -------------------------------------------------------------
  // 1. FLOOR & ROOM ENCLOSURE
  // -------------------------------------------------------------
  const floorGeo = addDisposable(new THREE.PlaneGeometry(7.0, 7.0));
  const floorMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#070a13',
      roughness: 0.85,
      metalness: 0.1,
    })
  );
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, -0.75, 0);
  floorMesh.receiveShadow = true;
  envGroup.add(floorMesh);

  // Floor subtle grid pattern
  const floorGrid = new THREE.GridHelper(6.0, 30, '#1e293b', '#0f172a');
  floorGrid.position.set(0, -0.749, 0);
  envGroup.add(floorGrid);

  // Back Wall
  const wallGeo = addDisposable(new THREE.PlaneGeometry(6.0, 3.2));
  const wallMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#0b1120',
      roughness: 0.9,
      metalness: 0.05,
    })
  );
  const wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 0.75, -0.88);
  wallMesh.receiveShadow = true;
  envGroup.add(wallMesh);

  // Acoustic Wood Slat Feature Accent behind desk
  const slatCount = 28;
  const slatWidth = 0.035;
  const slatSpacing = 0.06;
  const slatStartX = -(slatCount * slatSpacing) / 2;
  const slatGeo = addDisposable(new THREE.BoxGeometry(slatWidth, 2.0, 0.012));
  const slatMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#332219',
      roughness: 0.7,
      metalness: 0.05,
    })
  );

  for (let i = 0; i < slatCount; i++) {
    const slat = new THREE.Mesh(slatGeo, slatMat);
    slat.position.set(slatStartX + i * slatSpacing, 0.65, -0.87);
    slat.receiveShadow = true;
    envGroup.add(slat);
  }

  // -------------------------------------------------------------
  // 2. WALL SHELF & POSTERS
  // -------------------------------------------------------------
  // Floating wooden shelf
  const shelfGeo = addDisposable(new THREE.BoxGeometry(1.6, 0.03, 0.22));
  const shelfMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.5,
      metalness: 0.2,
    })
  );
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.position.set(0.1, 0.65, -0.76);
  shelf.castShadow = true;
  shelf.receiveShadow = true;
  envGroup.add(shelf);

  // Metal shelf brackets
  const bracketGeo = addDisposable(new THREE.BoxGeometry(0.02, 0.12, 0.18));
  const bracketMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.3, metalness: 0.8 })
  );
  for (const bx of [-0.55, 0.55]) {
    const bracket = new THREE.Mesh(bracketGeo, bracketMat);
    bracket.position.set(0.1 + bx, 0.59, -0.78);
    envGroup.add(bracket);
  }

  // Shelf Books ("Robotics", "Computer Vision", "Deep Learning")
  const shelfBookColors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
  for (let i = 0; i < 5; i++) {
    const sbGeo = addDisposable(new THREE.BoxGeometry(0.04, 0.18, 0.14));
    const sbMat = addDisposable(
      new THREE.MeshStandardMaterial({ color: shelfBookColors[i], roughness: 0.6 })
    );
    const sb = new THREE.Mesh(sbGeo, sbMat);
    sb.position.set(-0.55 + i * 0.045, 0.755, -0.75);
    sb.castShadow = true;
    envGroup.add(sb);
  }

  // Small potted trailing succulent on shelf
  const shelfPotGeo = addDisposable(new THREE.CylinderGeometry(0.05, 0.04, 0.07, 12));
  const terracottaMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#c2410c', roughness: 0.7 })
  );
  const shelfPot = new THREE.Mesh(shelfPotGeo, terracottaMat);
  shelfPot.position.set(0.72, 0.70, -0.75);
  shelfPot.castShadow = true;
  envGroup.add(shelfPot);

  const shelfPlantGeo = addDisposable(new THREE.SphereGeometry(0.065, 10, 10));
  const plantGreenMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 })
  );
  const shelfPlant = new THREE.Mesh(shelfPlantGeo, plantGreenMat);
  shelfPlant.position.set(0.72, 0.76, -0.75);
  shelfPlant.scale.set(1.2, 0.9, 1.2);
  envGroup.add(shelfPlant);

  // Decorative Engineering Brass Gear on shelf
  const gearGeo = addDisposable(new THREE.TorusGeometry(0.06, 0.015, 8, 20));
  const brassMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.85, roughness: 0.25 })
  );
  const gearMesh = new THREE.Mesh(gearGeo, brassMat);
  gearMesh.position.set(0.2, 0.74, -0.74);
  gearMesh.castShadow = true;
  envGroup.add(gearMesh);

  // Framed MINMINI Architecture Poster on wall
  const posterCanvas = document.createElement('canvas');
  posterCanvas.width = 512;
  posterCanvas.height = 320;
  const pCtx = posterCanvas.getContext('2d');
  if (pCtx) {
    pCtx.fillStyle = '#0f172a';
    pCtx.fillRect(0, 0, 512, 320);
    pCtx.strokeStyle = '#0284c7';
    pCtx.lineWidth = 4;
    pCtx.strokeRect(8, 8, 496, 304);

    pCtx.fillStyle = '#38bdf8';
    pCtx.font = 'bold 22px monospace';
    pCtx.fillText('MINMINI • DESKTOP PERSONAL CARE ROBOT', 24, 46);

    pCtx.fillStyle = '#94a3b8';
    pCtx.font = '14px sans-serif';
    pCtx.fillText('Digital Twin Architecture & Real-Time Kinematics Bridge', 24, 72);

    // Flow diagram blocks
    const drawBox = (x: number, y: number, w: number, h: number, title: string, sub: string) => {
      pCtx.fillStyle = '#1e293b';
      pCtx.fillRect(x, y, w, h);
      pCtx.strokeStyle = '#38bdf8';
      pCtx.lineWidth = 1.5;
      pCtx.strokeRect(x, y, w, h);
      pCtx.fillStyle = '#f8fafc';
      pCtx.font = 'bold 12px sans-serif';
      pCtx.fillText(title, x + 10, y + 20);
      pCtx.fillStyle = '#94a3b8';
      pCtx.font = '10px sans-serif';
      pCtx.fillText(sub, x + 10, y + 36);
    };

    drawBox(24, 110, 130, 48, 'SENSORS', 'Sonar + PiCam + IR');
    drawBox(184, 110, 130, 48, 'CORE COMPUTE', 'Raspberry Pi 5');
    drawBox(344, 110, 140, 48, 'ACTUATORS', '2x Servos + 2x Motors');
    drawBox(24, 200, 180, 52, 'BILINGUAL AI ENGINE', 'GLM-5.2 / Gemini');
    drawBox(240, 200, 244, 52, 'DIGITAL TWIN (THREE.JS)', 'ROS2 Kinematics Synchronization');

    pCtx.fillStyle = '#38bdf8';
    pCtx.font = 'bold 11px monospace';
    pCtx.fillText('SKCET B.E. CAPSTONE PROJECT • 2026', 24, 296);
  }
  const posterTexture = addDisposable(new THREE.CanvasTexture(posterCanvas));
  const posterMat = addDisposable(
    new THREE.MeshBasicMaterial({ map: posterTexture })
  );
  const posterGeo = addDisposable(new THREE.PlaneGeometry(1.0, 0.62));
  const posterMesh = new THREE.Mesh(posterGeo, posterMat);
  posterMesh.position.set(-0.25, 0.72, -0.86);
  envGroup.add(posterMesh);

  // Poster Frame
  const frameGeo = addDisposable(new THREE.BoxGeometry(1.04, 0.66, 0.015));
  const frameMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5, metalness: 0.5 })
  );
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  frameMesh.position.set(-0.25, 0.72, -0.868);
  envGroup.add(frameMesh);

  // -------------------------------------------------------------
  // 3. WORKSTATION DESK SURFACE & LEGS
  // -------------------------------------------------------------
  // Main Desktop (Slate / Walnut composite)
  const deskWidth = 2.6;
  const deskDepth = 1.55;
  const deskThick = 0.04;
  const deskGeo = addDisposable(new THREE.BoxGeometry(deskWidth, deskThick, deskDepth));
  const deskMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#1b2434',
      roughness: 0.45,
      metalness: 0.12,
    })
  );
  const deskMesh = new THREE.Mesh(deskGeo, deskMat);
  deskMesh.position.set(0, -deskThick / 2, 0); // Top is at y = 0.0
  deskMesh.receiveShadow = true;
  deskMesh.castShadow = true;
  envGroup.add(deskMesh);

  // Front Chamfer / Beveled edge accent strip
  const bevelGeo = addDisposable(new THREE.BoxGeometry(deskWidth, 0.012, 0.012));
  const bevelMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4, metalness: 0.3 })
  );
  const bevelMesh = new THREE.Mesh(bevelGeo, bevelMat);
  bevelMesh.position.set(0, -0.006, deskDepth / 2 + 0.005);
  envGroup.add(bevelMesh);

  // Heavy Duty Steel Desk Legs (T-Frame)
  const legSteelMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.35,
      metalness: 0.75,
    })
  );
  const legHeight = 0.73; // Reaches floor at y = -0.75

  for (const legX of [-1.15, 1.15]) {
    // Vertical Posts (Dual Square Posts for rigidity)
    for (const postZ of [-0.28, 0.28]) {
      const postGeo = addDisposable(new THREE.BoxGeometry(0.05, legHeight, 0.05));
      const post = new THREE.Mesh(postGeo, legSteelMat);
      post.position.set(legX, -deskThick - legHeight / 2, postZ);
      post.castShadow = true;
      post.receiveShadow = true;
      envGroup.add(post);
    }

    // Top mounting plate under desktop
    const topPlateGeo = addDisposable(new THREE.BoxGeometry(0.08, 0.02, 0.75));
    const topPlate = new THREE.Mesh(topPlateGeo, legSteelMat);
    topPlate.position.set(legX, -deskThick - 0.01, 0);
    envGroup.add(topPlate);

    // Bottom horizontal floor foot rail
    const footRailGeo = addDisposable(new THREE.BoxGeometry(0.09, 0.03, 0.85));
    const footRail = new THREE.Mesh(footRailGeo, legSteelMat);
    footRail.position.set(legX, -0.735, 0);
    footRail.castShadow = true;
    footRail.receiveShadow = true;
    envGroup.add(footRail);

    // Rubber floor leveling pads
    for (const pz of [-0.38, 0.38]) {
      const padGeo = addDisposable(new THREE.CylinderGeometry(0.025, 0.025, 0.015, 12));
      const padMat = addDisposable(new THREE.MeshBasicMaterial({ color: '#090d16' }));
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(legX, -0.745, pz);
      envGroup.add(pad);
    }
  }

  // Cross Support Beam connecting legs under the desk
  const crossBeamGeo = addDisposable(new THREE.BoxGeometry(2.2, 0.04, 0.04));
  const crossBeam = new THREE.Mesh(crossBeamGeo, legSteelMat);
  crossBeam.position.set(0, -0.22, -0.15);
  crossBeam.castShadow = true;
  envGroup.add(crossBeam);

  // -------------------------------------------------------------
  // 4. OVERSIZED DESK MAT
  // -------------------------------------------------------------
  const matWidth = 1.65;
  const matDepth = 0.90;
  const matGeo = addDisposable(new THREE.BoxGeometry(matWidth, 0.003, matDepth));
  const matMaterial = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#131b2b',
      roughness: 0.6,
      metalness: 0.1,
    })
  );
  const deskMatMesh = new THREE.Mesh(matGeo, matMaterial);
  deskMatMesh.position.set(0, 0.0015, -0.02);
  deskMatMesh.receiveShadow = true;
  envGroup.add(deskMatMesh);

  // Stitched border on desk mat
  const stitchGeo = addDisposable(new THREE.BoxGeometry(matWidth - 0.03, 0.0035, matDepth - 0.03));
  const stitchMat = addDisposable(new THREE.MeshBasicMaterial({ color: '#26354a', wireframe: true }));
  const stitchMesh = new THREE.Mesh(stitchGeo, stitchMat);
  stitchMesh.position.set(0, 0.0016, -0.02);
  envGroup.add(stitchMesh);

  // Subtle coordinate grid helper for kinematics tracking on desk mat
  const grid = new THREE.GridHelper(1.5, 15, '#38bdf8', '#1e293b');
  grid.position.set(0, 0.004, -0.02);
  envGroup.add(grid);

  // -------------------------------------------------------------
  // 5. LAPTOP ON ALUMINUM STAND WITH DYNAMIC SCREEN
  // -------------------------------------------------------------
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(-0.66, 0.003, -0.20);
  laptopGroup.rotation.y = 0.22;
  envGroup.add(laptopGroup);

  // Aluminum Laptop Stand
  const standMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.85, roughness: 0.25 })
  );
  const standBaseGeo = addDisposable(new THREE.BoxGeometry(0.24, 0.006, 0.20));
  const standBase = new THREE.Mesh(standBaseGeo, standMat);
  standBase.position.set(0, 0.003, 0);
  standBase.castShadow = true;
  laptopGroup.add(standBase);

  // Angled riser arms
  const riserGeo = addDisposable(new THREE.BoxGeometry(0.025, 0.07, 0.18));
  const riserLeft = new THREE.Mesh(riserGeo, standMat);
  riserLeft.position.set(-0.09, 0.038, 0.01);
  riserLeft.rotation.x = -0.24;
  laptopGroup.add(riserLeft);

  const riserRight = new THREE.Mesh(riserGeo, standMat);
  riserRight.position.set(0.09, 0.038, 0.01);
  riserRight.rotation.x = -0.24;
  laptopGroup.add(riserRight);

  // Laptop Base (Chassis)
  const laptopBaseGroup = new THREE.Group();
  laptopBaseGroup.position.set(0, 0.075, 0.02);
  laptopBaseGroup.rotation.x = -0.24;
  laptopGroup.add(laptopBaseGroup);

  const lpChassisGeo = addDisposable(new THREE.BoxGeometry(0.32, 0.01, 0.22));
  const lpChassis = new THREE.Mesh(lpChassisGeo, standMat);
  lpChassis.castShadow = true;
  laptopBaseGroup.add(lpChassis);

  // Laptop Keyboard well & keycaps
  const kbWellGeo = addDisposable(new THREE.BoxGeometry(0.28, 0.002, 0.11));
  const kbDarkMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.5 }));
  const kbWell = new THREE.Mesh(kbWellGeo, kbDarkMat);
  kbWell.position.set(0, 0.0055, -0.02);
  laptopBaseGroup.add(kbWell);

  // Trackpad
  const trackpadGeo = addDisposable(new THREE.BoxGeometry(0.10, 0.002, 0.065));
  const trackpadMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.3, metalness: 0.7 })
  );
  const trackpad = new THREE.Mesh(trackpadGeo, trackpadMat);
  trackpad.position.set(0, 0.0055, 0.065);
  laptopBaseGroup.add(trackpad);

  // Laptop Screen Lid (Angled open)
  const screenLidGroup = new THREE.Group();
  screenLidGroup.position.set(0, 0.005, -0.11);
  screenLidGroup.rotation.x = 1.95; // Open angle ~112 degrees
  laptopBaseGroup.add(screenLidGroup);

  const lidBackGeo = addDisposable(new THREE.BoxGeometry(0.32, 0.22, 0.007));
  const lidBack = new THREE.Mesh(lidBackGeo, standMat);
  lidBack.position.set(0, 0.11, -0.0035);
  lidBack.castShadow = true;
  screenLidGroup.add(lidBack);

  // Dynamic 2D Canvas for Laptop Display
  const laptopCanvas = document.createElement('canvas');
  laptopCanvas.width = 512;
  laptopCanvas.height = 320;
  const lpCtx = laptopCanvas.getContext('2d');
  const laptopTexture = addDisposable(new THREE.CanvasTexture(laptopCanvas));
  laptopTexture.minFilter = THREE.LinearFilter;

  const screenDispMat = addDisposable(
    new THREE.MeshBasicMaterial({ map: laptopTexture, toneMapped: false })
  );
  const screenDispGeo = addDisposable(new THREE.PlaneGeometry(0.30, 0.20));
  const screenDisplayMesh = new THREE.Mesh(screenDispGeo, screenDispMat);
  screenDisplayMesh.position.set(0, 0.11, 0.004);
  screenLidGroup.add(screenDisplayMesh);

  // Method to redraw the laptop screen
  const drawLaptopScreen = (state: RobotState) => {
    if (!lpCtx) return;
    lpCtx.fillStyle = '#090d16';
    lpCtx.fillRect(0, 0, 512, 320);

    // Title Bar
    lpCtx.fillStyle = '#0f172a';
    lpCtx.fillRect(0, 0, 512, 34);
    lpCtx.fillStyle = '#38bdf8';
    lpCtx.font = 'bold 13px monospace';
    lpCtx.fillText('MINMINI ROS2 TELEMETRY & DIGITAL TWIN HUD v2.4', 16, 22);

    // Status Pill
    lpCtx.fillStyle = state.syncStatus === 'synced' ? '#10b981' : '#f59e0b';
    lpCtx.fillRect(430, 10, 68, 16);
    lpCtx.fillStyle = '#090d16';
    lpCtx.font = 'bold 10px monospace';
    lpCtx.fillText(state.syncStatus.toUpperCase(), 438, 22);

    // Telemetry Grid
    lpCtx.fillStyle = '#1e293b';
    lpCtx.fillRect(16, 46, 230, 120);
    lpCtx.fillRect(266, 46, 230, 120);

    // Left Panel: Kinematics
    lpCtx.fillStyle = '#94a3b8';
    lpCtx.font = '11px monospace';
    lpCtx.fillText('ODOMETRY POSE (X, Z)', 28, 66);
    lpCtx.fillStyle = '#f8fafc';
    lpCtx.font = 'bold 16px monospace';
    lpCtx.fillText(`X: ${state.odometry.x.toFixed(2)}m  Z: ${state.odometry.z.toFixed(2)}m`, 28, 92);
    lpCtx.fillStyle = '#94a3b8';
    lpCtx.font = '11px monospace';
    lpCtx.fillText(`Heading: ${state.odometry.heading.toFixed(1)}°`, 28, 114);
    lpCtx.fillText(`Velocity: ${state.odometry.estimatedVelocityMps.toFixed(2)} m/s`, 28, 134);
    lpCtx.fillText(`Pan/Tilt: ${state.servo.panDeg.toFixed(0)}° / ${state.servo.tiltDeg.toFixed(0)}°`, 28, 154);

    // Right Panel: Hardware Telemetry
    lpCtx.fillStyle = '#94a3b8';
    lpCtx.font = '11px monospace';
    lpCtx.fillText('SENSORS & BATTERY', 278, 66);

    // Battery bar
    lpCtx.fillStyle = '#334155';
    lpCtx.fillRect(278, 78, 150, 14);
    const batW = (state.sensors.batteryPct / 100) * 150;
    lpCtx.fillStyle = state.sensors.batteryPct < 20 ? '#ef4444' : state.sensors.batteryPct < 50 ? '#f59e0b' : '#10b981';
    lpCtx.fillRect(278, 78, batW, 14);
    lpCtx.fillStyle = '#f8fafc';
    lpCtx.font = 'bold 10px monospace';
    lpCtx.fillText(`${state.sensors.batteryPct}% (${state.sensors.batteryVoltage.toFixed(2)}V)`, 434, 90);

    // Ultrasonic readout
    lpCtx.fillStyle = '#94a3b8';
    lpCtx.font = '11px monospace';
    lpCtx.fillText(`HC-SR04 Sonar: ${state.sensors.ultrasonicCm} cm`, 278, 114);
    lpCtx.fillText(`Pi 5 CPU Temp: ${state.sensors.temperatureC.toFixed(1)}°C`, 278, 134);
    lpCtx.fillText(`Twin Stream: ${state.sensors.fps} FPS (${state.syncStatus})`, 278, 154);

    // Bottom Terminal Box
    lpCtx.fillStyle = '#040711';
    lpCtx.fillRect(16, 178, 480, 126);
    lpCtx.strokeStyle = '#1e293b';
    lpCtx.strokeRect(16, 178, 480, 126);

    lpCtx.fillStyle = '#38bdf8';
    lpCtx.font = '11px monospace';
    lpCtx.fillText('> minmini_telemetry_node: broadcasting odometry at 40Hz', 26, 202);
    lpCtx.fillStyle = '#a78bfa';
    lpCtx.fillText(`> Current emotion: "${state.emotion}" | Activity: "${state.activity}"`, 26, 224);
    lpCtx.fillStyle = state.sensors.ultrasonicCm < 30 ? '#ef4444' : '#10b981';
    lpCtx.fillText(
      `> Obstacle status: ${state.sensors.ultrasonicCm < 30 ? 'HAZARD - CLOSE PROXIMITY' : 'CLEAR PASSAGE'}`,
      26,
      246
    );
    lpCtx.fillStyle = '#64748b';
    lpCtx.fillText(`> Timestamp: ${new Date().toLocaleTimeString()} • Bridge Online`, 26, 268);
    lpCtx.fillStyle = '#38bdf8';
    lpCtx.fillText('minmini@skcet-robotics:~$ █', 26, 290);

    laptopTexture.needsUpdate = true;
  };

  // -------------------------------------------------------------
  // 6. COMPACT MECHANICAL KEYBOARD & MOUSE
  // -------------------------------------------------------------
  const kbGroup = new THREE.Group();
  kbGroup.position.set(-0.16, 0.003, -0.19);
  envGroup.add(kbGroup);

  // 75% Keyboard chassis
  const kbChassisGeo = addDisposable(new THREE.BoxGeometry(0.30, 0.012, 0.12));
  const kbMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.5 })
  );
  const kbChassis = new THREE.Mesh(kbChassisGeo, kbMat);
  kbChassis.position.y = 0.006;
  kbChassis.castShadow = true;
  kbGroup.add(kbChassis);

  // Sculpted keycap rows
  const keyMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.7 }));
  const cyanKeyMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.6 }));

  for (let r = 0; r < 5; r++) {
    const rowZ = -0.045 + r * 0.022;
    const numKeys = r === 4 ? 7 : 14;
    for (let c = 0; c < numKeys; c++) {
      const keyW = r === 4 && c === 3 ? 0.09 : 0.016;
      const keyGeo = addDisposable(new THREE.BoxGeometry(keyW, 0.006, 0.016));
      const keyMesh = new THREE.Mesh(keyGeo, r === 2 && c === 13 ? cyanKeyMat : keyMat);
      const colX = -0.13 + (c / (numKeys - 1 || 1)) * 0.26;
      keyMesh.position.set(colX, 0.014, rowZ);
      kbGroup.add(keyMesh);
    }
  }

  // Coiled braided USB-C cable running from keyboard to laptop
  const cablePoints = [
    new THREE.Vector3(-0.05, 0.012, -0.06),
    new THREE.Vector3(-0.15, 0.010, -0.10),
    new THREE.Vector3(-0.35, 0.008, -0.12),
    new THREE.Vector3(-0.52, 0.015, -0.14),
  ];
  const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
  const cableGeo = addDisposable(new THREE.TubeGeometry(cableCurve, 20, 0.0025, 8, false));
  const cableMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.5 }));
  const cableMesh = new THREE.Mesh(cableGeo, cableMat);
  kbGroup.add(cableMesh);

  // Ergonomic Wireless Mouse & Mousepad
  const mouseGroup = new THREE.Group();
  mouseGroup.position.set(0.20, 0.003, -0.18);
  envGroup.add(mouseGroup);

  const mousePadGeo = addDisposable(new THREE.BoxGeometry(0.18, 0.002, 0.22));
  const mousePadMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 }));
  const mousePad = new THREE.Mesh(mousePadGeo, mousePadMat);
  mousePad.position.y = 0.001;
  mousePad.receiveShadow = true;
  mouseGroup.add(mousePad);

  const mouseGeo = addDisposable(new THREE.SphereGeometry(0.045, 16, 14));
  mouseGeo.scale(0.65, 0.4, 1.15);
  const mouseMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.35, metalness: 0.4 })
  );
  const mouseMesh = new THREE.Mesh(mouseGeo, mouseMat);
  mouseMesh.position.set(0, 0.016, 0);
  mouseMesh.castShadow = true;
  mouseGroup.add(mouseMesh);

  // -------------------------------------------------------------
  // 7. ARTICULATED ARCHITECT DESK LAMP WITH INTERACTIVE SPOTLIGHT
  // -------------------------------------------------------------
  const lampGroup = new THREE.Group();
  lampGroup.position.set(-0.92, 0.003, -0.42);
  envGroup.add(lampGroup);

  // Cast iron circular base
  const lampBaseGeo = addDisposable(new THREE.CylinderGeometry(0.09, 0.095, 0.018, 24));
  const lampMetalMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.6, roughness: 0.35 })
  );
  const lampBase = new THREE.Mesh(lampBaseGeo, lampMetalMat);
  lampBase.position.y = 0.009;
  lampBase.castShadow = true;
  lampGroup.add(lampBase);

  // Lower arm (angled up & forward)
  const armGeo = addDisposable(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 12));
  const armLower = new THREE.Mesh(armGeo, lampMetalMat);
  armLower.position.set(0.06, 0.18, 0.06);
  armLower.rotation.z = -0.38;
  armLower.rotation.x = 0.25;
  armLower.castShadow = true;
  lampGroup.add(armLower);

  // Mid-joint elbow fastener
  const elbowGeo = addDisposable(new THREE.SphereGeometry(0.018, 12, 12));
  const elbow = new THREE.Mesh(elbowGeo, brassMat);
  elbow.position.set(0.13, 0.33, 0.12);
  lampGroup.add(elbow);

  // Upper arm (angled down towards desk center)
  const armUpper = new THREE.Mesh(armGeo, lampMetalMat);
  armUpper.position.set(0.24, 0.42, 0.16);
  armUpper.rotation.z = -1.15;
  armUpper.rotation.x = 0.15;
  armUpper.castShadow = true;
  lampGroup.add(armUpper);

  // Conical Lamp Shade Head
  const shadeGeo = addDisposable(new THREE.ConeGeometry(0.075, 0.12, 20, 1, true));
  const lampShadeMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.3,
      metalness: 0.7,
      side: THREE.DoubleSide,
    })
  );
  const lampShade = new THREE.Mesh(shadeGeo, lampShadeMat);
  lampShade.position.set(0.38, 0.44, 0.18);
  lampShade.rotation.z = 1.1;
  lampShade.rotation.x = -0.3;
  lampShade.castShadow = true;
  lampGroup.add(lampShade);

  // Glowing Bulb Mesh
  const bulbGeo = addDisposable(new THREE.SphereGeometry(0.022, 14, 14));
  const bulbMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: '#fde047',
      emissiveIntensity: 1.2,
      roughness: 0.1,
    })
  );
  const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
  bulbMesh.position.set(0.38, 0.42, 0.18);
  lampGroup.add(bulbMesh);

  // Interactive SpotLight casting pool of light onto desk
  const lampSpotLight = new THREE.SpotLight('#fef08a', 1.8, 4.0, 0.75, 0.4, 1.2);
  lampSpotLight.position.set(-0.54, 0.44, -0.24);
  lampSpotLight.target.position.set(0, 0.0, 0.0);
  lampSpotLight.castShadow = true;
  lampSpotLight.shadow.mapSize.width = 512;
  lampSpotLight.shadow.mapSize.height = 512;
  lampSpotLight.shadow.bias = -0.001;
  scene.add(lampSpotLight);
  scene.add(lampSpotLight.target);

  // -------------------------------------------------------------
  // 8. DEDICATED ROBOT CHARGING DOCK
  // -------------------------------------------------------------
  const dockGroup = new THREE.Group();
  dockGroup.position.set(0.60, 0.003, -0.32);
  dockGroup.rotation.y = -0.35;
  envGroup.add(dockGroup);

  // Station base plate with beveled edges
  const dockBaseGeo = addDisposable(new THREE.BoxGeometry(0.24, 0.018, 0.22));
  const dockMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.35, metalness: 0.6 })
  );
  const dockBase = new THREE.Mesh(dockBaseGeo, dockMat);
  dockBase.position.y = 0.009;
  dockBase.castShadow = true;
  dockBase.receiveShadow = true;
  dockGroup.add(dockBase);

  // Alignment guide fins (left and right chamfers for wheels)
  for (const finX of [-0.10, 0.10]) {
    const finGeo = addDisposable(new THREE.BoxGeometry(0.015, 0.035, 0.18));
    const fin = new THREE.Mesh(finGeo, dockMat);
    fin.position.set(finX, 0.025, 0);
    dockGroup.add(fin);
  }

  // Upright Backrest Pillar
  const backrestGeo = addDisposable(new THREE.BoxGeometry(0.18, 0.12, 0.03));
  const backrest = new THREE.Mesh(backrestGeo, dockMat);
  backrest.position.set(0, 0.065, -0.095);
  backrest.castShadow = true;
  dockGroup.add(backrest);

  // Copper Leaf Spring Contact Terminals
  const contactMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.95, roughness: 0.15 })
  );
  for (const cx of [-0.03, 0.03]) {
    const contactGeo = addDisposable(new THREE.BoxGeometry(0.014, 0.008, 0.03));
    const contact = new THREE.Mesh(contactGeo, contactMat);
    contact.position.set(cx, 0.02, 0.02);
    dockGroup.add(contact);
  }

  // Multi-Color Status LED Ring
  const dockLedGeo = addDisposable(new THREE.RingGeometry(0.015, 0.025, 16));
  const dockLedMat = addDisposable(
    new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      emissive: '#0284c7',
      emissiveIntensity: 1.5,
    })
  );
  const dockLedMesh = new THREE.Mesh(dockLedGeo, dockLedMat);
  dockLedMesh.position.set(0, 0.08, -0.078);
  dockGroup.add(dockLedMesh);

  // Dock Heavy Gauge Braided Power Cable
  const dockCableGeo = addDisposable(new THREE.CylinderGeometry(0.004, 0.004, 0.35, 8));
  dockCableGeo.rotateX(Math.PI / 2);
  const dockCableMat = addDisposable(new THREE.MeshBasicMaterial({ color: '#090d16' }));
  const dockCable = new THREE.Mesh(dockCableGeo, dockCableMat);
  dockCable.position.set(0, 0.004, -0.26);
  dockGroup.add(dockCable);

  // -------------------------------------------------------------
  // 9. STUDENT STUDY & ENGINEERING ACCESSORIES
  // -------------------------------------------------------------
  // Spiral Lab Notebook
  const nbGroup = new THREE.Group();
  nbGroup.position.set(0.32, 0.003, 0.24);
  nbGroup.rotation.y = -0.15;
  envGroup.add(nbGroup);

  const nbBaseGeo = addDisposable(new THREE.BoxGeometry(0.18, 0.012, 0.24));
  const nbCoverMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.6 }));
  const nbMesh = new THREE.Mesh(nbBaseGeo, nbCoverMat);
  nbMesh.position.y = 0.006;
  nbMesh.castShadow = true;
  nbGroup.add(nbMesh);

  // Open white paper surface with grid lines
  const paperGeo = addDisposable(new THREE.PlaneGeometry(0.17, 0.22));
  const paperMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 }));
  const paperMesh = new THREE.Mesh(paperGeo, paperMat);
  paperMesh.rotation.x = -Math.PI / 2;
  paperMesh.position.set(0, 0.0125, 0);
  nbGroup.add(paperMesh);

  // Spiral Wire Binding
  const wireGeo = addDisposable(new THREE.CylinderGeometry(0.005, 0.005, 0.23, 8));
  wireGeo.rotateX(Math.PI / 2);
  const wireMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8 }));
  const wire = new THREE.Mesh(wireGeo, wireMat);
  wire.position.set(-0.088, 0.012, 0);
  nbGroup.add(wire);

  // Ballpoint Pen resting on notebook
  const penGeo = addDisposable(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 10));
  penGeo.rotateZ(Math.PI / 2);
  const penMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.5, roughness: 0.4 })
  );
  const pen = new THREE.Mesh(penGeo, penMat);
  pen.position.set(0.03, 0.017, 0.02);
  pen.rotation.y = 0.4;
  nbGroup.add(pen);

  // Sticky Notes ("Viva Review", "Calibrate Sonar")
  const stickyColors = ['#fef08a', '#f472b6', '#a78bfa'];
  for (let s = 0; s < 3; s++) {
    const stickyGeo = addDisposable(new THREE.PlaneGeometry(0.07, 0.07));
    const stickyMat = addDisposable(
      new THREE.MeshBasicMaterial({ color: stickyColors[s], side: THREE.DoubleSide })
    );
    const sticky = new THREE.Mesh(stickyGeo, stickyMat);
    sticky.rotation.x = -Math.PI / 2;
    sticky.position.set(0.48 + s * 0.05, 0.0035, 0.12 + s * 0.06);
    sticky.rotation.z = (s - 1) * 0.18;
    envGroup.add(sticky);
  }

  // Smartphone on Angled Aluminum Phone Dock
  const phoneGroup = new THREE.Group();
  phoneGroup.position.set(-0.42, 0.003, 0.28);
  phoneGroup.rotation.y = 0.35;
  envGroup.add(phoneGroup);

  const phoneStandGeo = addDisposable(new THREE.BoxGeometry(0.08, 0.05, 0.09));
  const phoneStand = new THREE.Mesh(phoneStandGeo, standMat);
  phoneStand.position.y = 0.025;
  phoneStand.castShadow = true;
  phoneGroup.add(phoneStand);

  const phoneBodyGeo = addDisposable(new THREE.BoxGeometry(0.075, 0.15, 0.008));
  const phoneBodyMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.9, roughness: 0.2 })
  );
  const phoneMesh = new THREE.Mesh(phoneBodyGeo, phoneBodyMat);
  phoneMesh.position.set(0, 0.06, 0.01);
  phoneMesh.rotation.x = -0.32;
  phoneMesh.castShadow = true;
  phoneGroup.add(phoneMesh);

  // Phone glowing lockscreen display
  const phoneScreenGeo = addDisposable(new THREE.PlaneGeometry(0.07, 0.14));
  const phoneScreenMat = addDisposable(
    new THREE.MeshBasicMaterial({ color: '#0284c7' })
  );
  const phoneScreen = new THREE.Mesh(phoneScreenGeo, phoneScreenMat);
  phoneScreen.position.set(0, 0.06, 0.016);
  phoneScreen.rotation.x = -0.32;
  phoneGroup.add(phoneScreen);

  // Small Tablet flat on desk
  const tabletGroup = new THREE.Group();
  tabletGroup.position.set(-0.62, 0.003, 0.26);
  tabletGroup.rotation.y = -0.15;
  envGroup.add(tabletGroup);

  const tabletGeo = addDisposable(new THREE.BoxGeometry(0.18, 0.007, 0.25));
  const tabletMesh = new THREE.Mesh(tabletGeo, phoneBodyMat);
  tabletMesh.position.y = 0.0035;
  tabletMesh.castShadow = true;
  tabletGroup.add(tabletMesh);

  const tabScreenGeo = addDisposable(new THREE.PlaneGeometry(0.165, 0.235));
  const tabScreenMat = addDisposable(new THREE.MeshBasicMaterial({ color: '#1e293b' }));
  const tabScreen = new THREE.Mesh(tabScreenGeo, tabScreenMat);
  tabScreen.rotation.x = -Math.PI / 2;
  tabScreen.position.y = 0.0075;
  tabletGroup.add(tabScreen);

  // Ceramic Coffee Mug with coffee liquid
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-0.74, 0.003, 0.10);
  envGroup.add(mugGroup);

  const mugGeo = addDisposable(new THREE.CylinderGeometry(0.042, 0.038, 0.09, 18, 1, true));
  const mugMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2, metalness: 0.05 })
  );
  const mug = new THREE.Mesh(mugGeo, mugMat);
  mug.position.y = 0.045;
  mug.castShadow = true;
  mugGroup.add(mug);

  // Coffee liquid surface
  const coffeeGeo = addDisposable(new THREE.CircleGeometry(0.038, 16));
  const coffeeMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.1 })
  );
  const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = 0.075;
  mugGroup.add(coffee);

  // Mug handle
  const handleGeo = addDisposable(new THREE.TorusGeometry(0.024, 0.006, 8, 16, Math.PI));
  const handle = new THREE.Mesh(handleGeo, mugMat);
  handle.position.set(-0.042, 0.045, 0);
  handle.rotation.z = Math.PI / 2;
  mugGroup.add(handle);

  // Insulated Stainless Vacuum Water Bottle
  const bottleGroup = new THREE.Group();
  bottleGroup.position.set(-0.84, 0.003, 0.24);
  envGroup.add(bottleGroup);

  const bottleGeo = addDisposable(new THREE.CylinderGeometry(0.036, 0.036, 0.20, 20));
  const bottleMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#38bdf8', metalness: 0.85, roughness: 0.2 })
  );
  const bottle = new THREE.Mesh(bottleGeo, bottleMat);
  bottle.position.y = 0.10;
  bottle.castShadow = true;
  bottleGroup.add(bottle);

  const bottleCapGeo = addDisposable(new THREE.CylinderGeometry(0.02, 0.025, 0.035, 16));
  const bottleCap = new THREE.Mesh(bottleCapGeo, lampMetalMat);
  bottleCap.position.y = 0.21;
  bottleGroup.add(bottleCap);

  // Small Succulent Plant on desk in terracotta planter
  const deskPlantGroup = new THREE.Group();
  deskPlantGroup.position.set(0.74, 0.003, -0.40);
  envGroup.add(deskPlantGroup);

  const potGeo = addDisposable(new THREE.CylinderGeometry(0.055, 0.04, 0.08, 16));
  const pot = new THREE.Mesh(potGeo, terracottaMat);
  pot.position.y = 0.04;
  pot.castShadow = true;
  deskPlantGroup.add(pot);

  // Succulent rosette leaves
  for (let l = 0; l < 8; l++) {
    const leafGeo = addDisposable(new THREE.ConeGeometry(0.022, 0.06, 6));
    const leaf = new THREE.Mesh(leafGeo, plantGreenMat);
    const angle = (l / 8) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.025, 0.08, Math.sin(angle) * 0.025);
    leaf.rotation.x = Math.sin(angle) * 0.5;
    leaf.rotation.z = -Math.cos(angle) * 0.5;
    deskPlantGroup.add(leaf);
  }

  // Modern Digital LED Desk Clock
  const clockGroup = new THREE.Group();
  clockGroup.position.set(-0.46, 0.003, -0.42);
  clockGroup.rotation.y = 0.25;
  envGroup.add(clockGroup);

  const clockBodyGeo = addDisposable(new THREE.BoxGeometry(0.13, 0.045, 0.04));
  const clockBody = new THREE.Mesh(clockBodyGeo, lampMatteMat(lampMetalMat));
  clockBody.position.y = 0.0225;
  clockBody.castShadow = true;
  clockGroup.add(clockBody);

  const clockCanvas = document.createElement('canvas');
  clockCanvas.width = 256;
  clockCanvas.height = 96;
  const cCtx = clockCanvas.getContext('2d');
  const clockTexture = addDisposable(new THREE.CanvasTexture(clockCanvas));
  const clockFaceMat = addDisposable(
    new THREE.MeshBasicMaterial({ map: clockTexture, toneMapped: false })
  );
  const clockFaceGeo = addDisposable(new THREE.PlaneGeometry(0.12, 0.038));
  const clockFace = new THREE.Mesh(clockFaceGeo, clockFaceMat);
  clockFace.position.set(0, 0.0225, 0.021);
  clockGroup.add(clockFace);

  const drawClock = () => {
    if (!cCtx) return;
    cCtx.fillStyle = '#020617';
    cCtx.fillRect(0, 0, 256, 96);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    cCtx.fillStyle = '#38bdf8';
    cCtx.font = 'bold 36px monospace';
    cCtx.textAlign = 'center';
    cCtx.textBaseline = 'middle';
    cCtx.fillText(timeStr, 128, 48);
    clockTexture.needsUpdate = true;
  };
  drawClock();

  // Electronics Parts Tray / Raspberry Pi 5 module & Micro-servo
  const partsGroup = new THREE.Group();
  partsGroup.position.set(0.76, 0.003, 0.08);
  partsGroup.rotation.y = -0.2;
  envGroup.add(partsGroup);

  const trayGeo = addDisposable(new THREE.BoxGeometry(0.16, 0.015, 0.22));
  const trayMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.3, metalness: 0.7 })
  );
  const tray = new THREE.Mesh(trayGeo, trayMat);
  tray.position.y = 0.0075;
  tray.castShadow = true;
  partsGroup.add(tray);

  // Green PCB representation of Raspberry Pi 5
  const pcbGeo = addDisposable(new THREE.BoxGeometry(0.085, 0.004, 0.056));
  const pcbMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.5 }));
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.set(-0.02, 0.017, -0.04);
  partsGroup.add(pcb);

  // Aluminum CPU Heatsink on RPi
  const heatsinkGeo = addDisposable(new THREE.BoxGeometry(0.025, 0.01, 0.025));
  const heatsinkMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.2 })
  );
  const heatsink = new THREE.Mesh(heatsinkGeo, heatsinkMat);
  heatsink.position.set(-0.02, 0.024, -0.04);
  partsGroup.add(heatsink);

  // Blue Micro Servo (SG90) in parts tray
  const servoGeo = addDisposable(new THREE.BoxGeometry(0.022, 0.024, 0.012));
  const servoMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.4 }));
  const servo = new THREE.Mesh(servoGeo, servoMat);
  servo.position.set(0.03, 0.027, 0.04);
  partsGroup.add(servo);

  // Studio Over-Ear Headphones on Stand
  const hpGroup = new THREE.Group();
  hpGroup.position.set(-1.02, 0.003, -0.16);
  envGroup.add(hpGroup);

  const hpStandBaseGeo = addDisposable(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16));
  const hpStandBase = new THREE.Mesh(hpStandBaseGeo, lampMetalMat);
  hpStandBase.position.y = 0.005;
  hpGroup.add(hpStandBase);

  const hpPoleGeo = addDisposable(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 12));
  const hpPole = new THREE.Mesh(hpPoleGeo, lampMetalMat);
  hpPole.position.y = 0.135;
  hpGroup.add(hpPole);

  const hpCradleGeo = addDisposable(new THREE.TorusGeometry(0.04, 0.008, 8, 16, Math.PI));
  const hpCradle = new THREE.Mesh(hpCradleGeo, lampMetalMat);
  hpCradle.position.y = 0.26;
  hpGroup.add(hpCradle);

  // Headphone earcup pads
  const earcupGeo = addDisposable(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16));
  earcupGeo.rotateZ(Math.PI / 2);
  const earcupMat = addDisposable(new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.8 }));
  for (const ey of [-0.045, 0.045]) {
    const cup = new THREE.Mesh(earcupGeo, earcupMat);
    cup.position.set(ey, 0.21, 0);
    hpGroup.add(cup);
  }

  // Desktop Soundbar / Speaker behind keyboard
  const speakerGeo = addDisposable(new THREE.BoxGeometry(0.38, 0.032, 0.045));
  const speakerMat = addDisposable(
    new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.7, metalness: 0.2 })
  );
  const speaker = new THREE.Mesh(speakerGeo, speakerMat);
  speaker.position.set(-0.16, 0.018, -0.44);
  speaker.castShadow = true;
  envGroup.add(speaker);

  // Speaker subtle LED status light
  const spkLedGeo = addDisposable(new THREE.BoxGeometry(0.01, 0.003, 0.002));
  const spkLedMat = addDisposable(new THREE.MeshBasicMaterial({ color: '#38bdf8' }));
  const spkLed = new THREE.Mesh(spkLedGeo, spkLedMat);
  spkLed.position.set(-0.16, 0.024, -0.417);
  envGroup.add(spkLed);

  function lampMatteMat(baseMat: THREE.Material): THREE.Material {
    return baseMat;
  }

  // -------------------------------------------------------------
  // CONTROLLER INTERFACES
  // -------------------------------------------------------------
  return {
    updateLaptopScreen: (state: RobotState) => {
      drawLaptopScreen(state);
    },
    updateClock: () => {
      drawClock();
    },
    updateDockLed: (state: RobotState) => {
      if (dockLedMat) {
        if (state.activity === 'sleeping' || state.sensors.batteryPct > 95) {
          dockLedMat.color.set('#10b981'); // Full / Green
          dockLedMat.emissive.set('#059669');
        } else if (state.sensors.batteryPct < 20) {
          dockLedMat.color.set('#ef4444'); // Low / Red
          dockLedMat.emissive.set('#dc2626');
        } else {
          dockLedMat.color.set('#38bdf8'); // Ready / Cyan
          dockLedMat.emissive.set('#0284c7');
        }
      }
    },
    setDeskLamp: (on: boolean, warm: boolean, intensity: number) => {
      lampSpotLight.visible = on;
      lampSpotLight.intensity = on ? intensity * 1.8 : 0;
      const col = warm ? '#fef08a' : '#e0f2fe';
      lampSpotLight.color.set(col);
      bulbMat.emissive.set(on ? (warm ? '#fde047' : '#bae6fd') : '#000000');
      bulbMat.emissiveIntensity = on ? intensity * 1.5 : 0;
    },
    dispose: () => {
      scene.remove(envGroup);
      scene.remove(lampSpotLight);
      scene.remove(lampSpotLight.target);
      disposableResources.forEach((res) => res.dispose());
    },
  };
}
