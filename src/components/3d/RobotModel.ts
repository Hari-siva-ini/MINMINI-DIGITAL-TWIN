/**
 * MINMINI 3D Robot Model
 * Faithfully engineered to match the Fusion 360 CAD model and prototype hardware:
 * - Tapered conical frustum chassis with rounded shoulder dome and horizontal split lines
 * - Lower metallic skirt with glowing cyan edge-detection / status LED halo strip
 * - Front chest panel with obsidian badge, silver bezel, status LED bar, and glowing microphone
 * - High-traction differential drive wheels with rubber tires and clean white/metallic hubcaps
 * - Front caster wheel assembly with recessed housing
 * - Dual-axis articulating neck collar & pivot
 * - Arched-crown tablet head enclosure with recessed front bezel
 * - Top pill-shaped camera bar with dual optical lenses
 * - Side speaker pods with circular glowing cyan LED halo rings
 * - Live CanvasTexture digital face display showing animated expressive eyes, eyebrows, and mouth
 */

import * as THREE from 'three';
import { RobotState } from '../../types/minmini';

export interface RobotModelHandles {
  robotRoot: THREE.Group;
  headServoGroup: THREE.Group;
  headTiltGroup: THREE.Group;
  leftWheel: THREE.Object3D;
  rightWheel: THREE.Object3D;
  casterWheel: THREE.Object3D;
  screenMesh: THREE.Mesh;
  ultrasonicRay: THREE.Line;
  skirtLedMesh: THREE.Mesh;
  chestLedBar: THREE.Mesh;
  leftSpeakerLed: THREE.Mesh;
  rightSpeakerLed: THREE.Mesh;
  update: (state: RobotState, elapsed: number) => void;
  dispose: () => void;
}

export function createRobotModel(options: { faceTexture: THREE.CanvasTexture }): RobotModelHandles {
  const disposables: { dispose: () => void }[] = [];

  const robotRoot = new THREE.Group();
  robotRoot.position.set(0, 0, 0);

  // ==========================================
  // SHARED MATERIALS
  // ==========================================
  // 1. Glossy pearlescent white chassis plastic (Image 1 & 2)
  const chassisMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc',
    roughness: 0.22,
    metalness: 0.06,
  });
  disposables.push(chassisMat);

  // 2. Lower metallic skirt & chassis bumper
  const skirtMat = new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.32,
    metalness: 0.65,
  });
  disposables.push(skirtMat);

  // 3. Obsidian glossy acrylic (bezel, camera pill, chest badge)
  const darkAcrylicMat = new THREE.MeshStandardMaterial({
    color: '#090d16',
    roughness: 0.15,
    metalness: 0.25,
  });
  disposables.push(darkAcrylicMat);

  // 4. Matte dark accent (neck joint, tire rubber, vents)
  const darkMatteMat = new THREE.MeshStandardMaterial({
    color: '#18181b',
    roughness: 0.75,
    metalness: 0.1,
  });
  disposables.push(darkMatteMat);

  // 5. Polished chrome & silver accents
  const chromeMat = new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    roughness: 0.12,
    metalness: 0.9,
  });
  disposables.push(chromeMat);

  // 6. Glowing Cyan LED Emissive Materials (Edge detection halo, speaker rings, chest bar)
  const cyanLedMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.1,
  });
  disposables.push(cyanLedMat);

  const cyanBrightLedMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
  });
  disposables.push(cyanBrightLedMat);

  // ==========================================
  // 1. LOWER CHASSIS & TORSO (Matching CAD Conical Profile)
  // ==========================================
  const chassisGroup = new THREE.Group();
  robotRoot.add(chassisGroup);

  // Lower conical body (frustum tapering from bottom ~0.108 to top ~0.078)
  const bodyFrustumGeo = new THREE.CylinderGeometry(0.078, 0.108, 0.105, 36);
  disposables.push(bodyFrustumGeo);
  const bodyFrustumMesh = new THREE.Mesh(bodyFrustumGeo, chassisMat);
  bodyFrustumMesh.position.y = 0.088;
  bodyFrustumMesh.castShadow = true;
  bodyFrustumMesh.receiveShadow = true;
  chassisGroup.add(bodyFrustumMesh);

  // Upper shoulder dome / fillet transitioning smoothly into neck collar
  const shoulderDomeGeo = new THREE.SphereGeometry(0.078, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  shoulderDomeGeo.scale(1.0, 0.38, 1.0);
  disposables.push(shoulderDomeGeo);
  const shoulderDomeMesh = new THREE.Mesh(shoulderDomeGeo, chassisMat);
  shoulderDomeMesh.position.y = 0.14;
  shoulderDomeMesh.castShadow = true;
  chassisGroup.add(shoulderDomeMesh);

  // Upper horizontal parting groove line (visible in CAD model)
  const upperGrooveGeo = new THREE.TorusGeometry(0.08, 0.0018, 8, 36);
  upperGrooveGeo.rotateX(Math.PI / 2);
  disposables.push(upperGrooveGeo);
  const upperGrooveMesh = new THREE.Mesh(upperGrooveGeo, darkMatteMat);
  upperGrooveMesh.position.y = 0.138;
  chassisGroup.add(upperGrooveMesh);

  // Lower metallic skirt tier (underbody bumper)
  const skirtGeo = new THREE.CylinderGeometry(0.108, 0.114, 0.026, 36);
  disposables.push(skirtGeo);
  const skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
  skirtMesh.position.y = 0.025;
  skirtMesh.castShadow = true;
  skirtMesh.receiveShadow = true;
  chassisGroup.add(skirtMesh);

  // Skirt bottom step / bevel
  const skirtBaseGeo = new THREE.CylinderGeometry(0.114, 0.112, 0.008, 36);
  disposables.push(skirtBaseGeo);
  const skirtBaseMesh = new THREE.Mesh(skirtBaseGeo, darkMatteMat);
  skirtBaseMesh.position.y = 0.01;
  chassisGroup.add(skirtBaseMesh);

  // Glowing Cyan LED Strip / Halo along skirt perimeter (Image 2: Edge Detection / Status)
  const skirtLedGeo = new THREE.TorusGeometry(0.109, 0.0022, 10, 48);
  skirtLedGeo.rotateX(Math.PI / 2);
  disposables.push(skirtLedGeo);
  const skirtLedMesh = new THREE.Mesh(skirtLedGeo, cyanLedMat);
  skirtLedMesh.position.y = 0.036;
  chassisGroup.add(skirtLedMesh);

  // Front Caster Wheel Cutout & Wheel Assembly
  const casterHousingGeo = new THREE.BoxGeometry(0.034, 0.02, 0.03);
  disposables.push(casterHousingGeo);
  const casterHousing = new THREE.Mesh(casterHousingGeo, darkMatteMat);
  casterHousing.position.set(0, 0.018, 0.092);
  chassisGroup.add(casterHousing);

  // Front Caster Wheel (Black rubber with pivot fork)
  const casterWheelGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.012, 16);
  casterWheelGeo.rotateZ(Math.PI / 2);
  disposables.push(casterWheelGeo);
  const casterWheel = new THREE.Mesh(casterWheelGeo, darkMatteMat);
  casterWheel.position.set(0, 0.013, 0.092);
  casterWheel.castShadow = true;
  chassisGroup.add(casterWheel);

  // Rear Stabilizer Ball Runner (Under chassis rear)
  const rearRunnerGeo = new THREE.SphereGeometry(0.011, 12, 12);
  disposables.push(rearRunnerGeo);
  const rearRunner = new THREE.Mesh(rearRunnerGeo, darkMatteMat);
  rearRunner.position.set(0, 0.011, -0.085);
  chassisGroup.add(rearRunner);

  // ==========================================
  // 2. FRONT CHEST BADGE (Image 2: Microphone / Voice Interaction)
  // ==========================================
  const chestBadgeGroup = new THREE.Group();
  chestBadgeGroup.position.set(0, 0.095, 0.088);
  chestBadgeGroup.rotation.x = -0.22; // Aligned with conical slope
  chassisGroup.add(chestBadgeGroup);

  // Silver / chrome badge bezel frame
  const badgeBezelGeo = new THREE.BoxGeometry(0.054, 0.05, 0.005);
  disposables.push(badgeBezelGeo);
  const badgeBezelMesh = new THREE.Mesh(badgeBezelGeo, chromeMat);
  badgeBezelMesh.position.z = 0.002;
  chestBadgeGroup.add(badgeBezelMesh);

  // Obsidian glossy dark center badge plate
  const badgePlateGeo = new THREE.BoxGeometry(0.05, 0.046, 0.006);
  disposables.push(badgePlateGeo);
  const badgePlateMesh = new THREE.Mesh(badgePlateGeo, darkAcrylicMat);
  badgePlateMesh.position.z = 0.004;
  chestBadgeGroup.add(badgePlateMesh);

  // Glowing Cyan Horizontal Status LED Bar on Chest Badge
  const chestLedBarGeo = new THREE.BoxGeometry(0.032, 0.0032, 0.007);
  disposables.push(chestLedBarGeo);
  const chestLedBar = new THREE.Mesh(chestLedBarGeo, cyanBrightLedMat);
  chestLedBar.position.set(0, 0.014, 0.006);
  chestBadgeGroup.add(chestLedBar);

  // Glowing Microphone Icon Graphics on Chest Badge
  const micIconGroup = new THREE.Group();
  micIconGroup.position.set(0, -0.006, 0.006);
  chestBadgeGroup.add(micIconGroup);

  // Mic capsule body
  const micCapsuleGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.009, 12);
  disposables.push(micCapsuleGeo);
  const micCapsuleMesh = new THREE.Mesh(micCapsuleGeo, cyanBrightLedMat);
  micIconGroup.add(micCapsuleMesh);

  // Mic cradle arc (U-bracket)
  const micCradleGeo = new THREE.TorusGeometry(0.0055, 0.001, 8, 16, Math.PI);
  micCradleGeo.rotateZ(Math.PI);
  disposables.push(micCradleGeo);
  const micCradleMesh = new THREE.Mesh(micCradleGeo, cyanBrightLedMat);
  micCradleMesh.position.set(0, -0.002, 0);
  micIconGroup.add(micCradleMesh);

  // Mic stand stem & base foot
  const micStemGeo = new THREE.CylinderGeometry(0.0009, 0.0009, 0.004, 8);
  disposables.push(micStemGeo);
  const micStemMesh = new THREE.Mesh(micStemGeo, cyanBrightLedMat);
  micStemMesh.position.set(0, -0.008, 0);
  micIconGroup.add(micStemMesh);

  const micFootGeo = new THREE.BoxGeometry(0.007, 0.001, 0.002);
  disposables.push(micFootGeo);
  const micFootMesh = new THREE.Mesh(micFootGeo, cyanBrightLedMat);
  micFootMesh.position.set(0, -0.01, 0);
  micIconGroup.add(micFootMesh);

  // ==========================================
  // 3. DIFFERENTIAL DRIVE WHEELS (Left & Right)
  // ==========================================
  // Large circular wheels matching CAD Image 1 and prototype Image 2:
  // Diameter: 84mm (radius 0.042m), Width: 24mm (0.024m)
  const wheelRadius = 0.042;
  const wheelWidth = 0.024;
  const wheelTrackX = 0.108; // Offset from centerline

  const createWheel = (isLeft: boolean): THREE.Object3D => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(isLeft ? wheelTrackX : -wheelTrackX, wheelRadius, 0);

    // Wheel rotator group (will roll around X axis)
    const rotator = new THREE.Group();
    wheelGroup.add(rotator);

    // Black rubber tire cylinder
    const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
    tireGeo.rotateZ(Math.PI / 2);
    disposables.push(tireGeo);
    const tireMesh = new THREE.Mesh(tireGeo, darkMatteMat);
    tireMesh.castShadow = true;
    tireMesh.receiveShadow = true;
    rotator.add(tireMesh);

    // Inner rim recess step
    const rimStepGeo = new THREE.CylinderGeometry(wheelRadius * 0.88, wheelRadius * 0.88, wheelWidth + 0.001, 28);
    rimStepGeo.rotateZ(Math.PI / 2);
    disposables.push(rimStepGeo);
    const rimStepMesh = new THREE.Mesh(rimStepGeo, darkAcrylicMat);
    rotator.add(rimStepMesh);

    // Large white hubcap disc (Images 1 & 2 show clean white face disc)
    const hubcapGeo = new THREE.CylinderGeometry(wheelRadius * 0.74, wheelRadius * 0.74, wheelWidth + 0.0025, 28);
    hubcapGeo.rotateZ(Math.PI / 2);
    disposables.push(hubcapGeo);
    const hubcapMesh = new THREE.Mesh(hubcapGeo, chassisMat);
    rotator.add(hubcapMesh);

    // Chrome center axle cap
    const axleCapGeo = new THREE.CylinderGeometry(wheelRadius * 0.26, wheelRadius * 0.26, wheelWidth + 0.0035, 20);
    axleCapGeo.rotateZ(Math.PI / 2);
    disposables.push(axleCapGeo);
    const axleCapMesh = new THREE.Mesh(axleCapGeo, chromeMat);
    rotator.add(axleCapMesh);

    return wheelGroup;
  };

  const leftWheel = createWheel(true);
  const rightWheel = createWheel(false);
  robotRoot.add(leftWheel);
  robotRoot.add(rightWheel);

  // ==========================================
  // 4. DUAL-AXIS ARTICULATING NECK JOINT
  // ==========================================
  // Neck base collar resting on top shoulder dome
  const neckCollarGeo = new THREE.CylinderGeometry(0.038, 0.046, 0.014, 28);
  disposables.push(neckCollarGeo);
  const neckCollarMesh = new THREE.Mesh(neckCollarGeo, darkMatteMat);
  neckCollarMesh.position.y = 0.155;
  chassisGroup.add(neckCollarMesh);

  // Chrome swivel bearing ring
  const bearingRingGeo = new THREE.CylinderGeometry(0.034, 0.034, 0.005, 28);
  disposables.push(bearingRingGeo);
  const bearingRingMesh = new THREE.Mesh(bearingRingGeo, chromeMat);
  bearingRingMesh.position.y = 0.162;
  chassisGroup.add(bearingRingMesh);

  // Head Pan & Tilt Servo Pivot Groups
  const headServoGroup = new THREE.Group();
  headServoGroup.position.set(0, 0.17, 0);
  robotRoot.add(headServoGroup);

  // Articulating neck post connecting to head
  const neckPostGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.026, 20);
  disposables.push(neckPostGeo);
  const neckPostMesh = new THREE.Mesh(neckPostGeo, darkMatteMat);
  neckPostMesh.position.y = 0.013;
  headServoGroup.add(neckPostMesh);

  // Head tilt sub-group (allows tilting independent of pan)
  const headTiltGroup = new THREE.Group();
  headTiltGroup.position.set(0, 0.028, 0);
  headServoGroup.add(headTiltGroup);

  // ==========================================
  // 5. HEAD ENCLOSURE (Matching Arched Top & CAD Contour)
  // ==========================================
  // Width: ~0.19, Height: ~0.13, Depth: ~0.09
  const headMainGroup = new THREE.Group();
  headMainGroup.position.set(0, 0.065, 0);
  headTiltGroup.add(headMainGroup);

  // Main central body of head
  const headBodyGeo = new THREE.BoxGeometry(0.182, 0.118, 0.082);
  disposables.push(headBodyGeo);
  const headBodyMesh = new THREE.Mesh(headBodyGeo, chassisMat);
  headBodyMesh.castShadow = true;
  headMainGroup.add(headBodyMesh);

  // Arched Crown / Roof (Matching Image 1 & 2 curved arched top profile)
  const archedCrownGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.082, 36, 1, false, Math.PI * 0.35, Math.PI * 0.3);
  archedCrownGeo.rotateZ(Math.PI / 2);
  archedCrownGeo.rotateY(Math.PI / 2);
  disposables.push(archedCrownGeo);
  const archedCrownMesh = new THREE.Mesh(archedCrownGeo, chassisMat);
  archedCrownMesh.position.set(0, 0.048, 0);
  archedCrownMesh.scale.set(0.42, 0.12, 1.0);
  archedCrownMesh.castShadow = true;
  headMainGroup.add(archedCrownMesh);

  // Smooth rounded corners on sides of head
  const cheekRGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.082, 20);
  cheekRGeo.rotateX(Math.PI / 2);
  disposables.push(cheekRGeo);
  const leftCheek = new THREE.Mesh(cheekRGeo, chassisMat);
  leftCheek.position.set(0.076, 0.008, 0);
  leftCheek.scale.set(0.35, 1.35, 1.0);
  headMainGroup.add(leftCheek);

  const rightCheek = new THREE.Mesh(cheekRGeo, chassisMat);
  rightCheek.position.set(-0.076, 0.008, 0);
  rightCheek.scale.set(0.35, 1.35, 1.0);
  headMainGroup.add(rightCheek);

  // Front recessed bezel frame (matching CAD Image 1 & Prototype Image 2)
  const frontFrameGeo = new THREE.BoxGeometry(0.174, 0.114, 0.006);
  disposables.push(frontFrameGeo);
  const frontFrameMesh = new THREE.Mesh(frontFrameGeo, darkAcrylicMat);
  frontFrameMesh.position.set(0, 0, 0.042);
  headMainGroup.add(frontFrameMesh);

  // Thin chrome accent trim around display window
  const frameBorderGeo = new THREE.BoxGeometry(0.176, 0.116, 0.003);
  disposables.push(frameBorderGeo);
  const frameBorderMesh = new THREE.Mesh(frameBorderGeo, chromeMat);
  frameBorderMesh.position.set(0, 0, 0.039);
  headMainGroup.add(frameBorderMesh);

  // ==========================================
  // 6. TOP CAMERA PILL (Image 2: Labeled "Camera")
  // ==========================================
  // Centered in top bezel, stadium / pill shaped recess
  const cameraPillGroup = new THREE.Group();
  cameraPillGroup.position.set(0, 0.045, 0.0455);
  headMainGroup.add(cameraPillGroup);

  const cameraHousingGeo = new THREE.BoxGeometry(0.062, 0.013, 0.004);
  disposables.push(cameraHousingGeo);
  const cameraHousingMesh = new THREE.Mesh(cameraHousingGeo, darkMatteMat);
  cameraPillGroup.add(cameraHousingMesh);

  // Rounded pill end caps
  const pillCapGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.004, 16);
  pillCapGeo.rotateX(Math.PI / 2);
  disposables.push(pillCapGeo);
  const pillLeftCap = new THREE.Mesh(pillCapGeo, darkMatteMat);
  pillLeftCap.position.set(0.031, 0, 0);
  cameraPillGroup.add(pillLeftCap);

  const pillRightCap = new THREE.Mesh(pillCapGeo, darkMatteMat);
  pillRightCap.position.set(-0.031, 0, 0);
  cameraPillGroup.add(pillRightCap);

  // Main RGB Camera lens (center)
  const lensGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.005, 16);
  lensGeo.rotateX(Math.PI / 2);
  disposables.push(lensGeo);
  const mainLens = new THREE.Mesh(lensGeo, chromeMat);
  mainLens.position.set(0.006, 0, 0.001);
  cameraPillGroup.add(mainLens);

  // Secondary IR Depth / Face tracking sensor (Image 2)
  const irSensorGeo = new THREE.CylinderGeometry(0.0026, 0.0026, 0.005, 14);
  irSensorGeo.rotateX(Math.PI / 2);
  disposables.push(irSensorGeo);
  const irSensor = new THREE.Mesh(irSensorGeo, darkAcrylicMat);
  irSensor.position.set(-0.014, 0, 0.001);
  cameraPillGroup.add(irSensor);

  // Tiny status optical LED dot
  const camLedGeo = new THREE.CylinderGeometry(0.0012, 0.0012, 0.005, 10);
  camLedGeo.rotateX(Math.PI / 2);
  disposables.push(camLedGeo);
  const camLedMesh = new THREE.Mesh(camLedGeo, cyanBrightLedMat);
  camLedMesh.position.set(0.022, 0, 0.001);
  cameraPillGroup.add(camLedMesh);

  // ==========================================
  // 7. TOUCHSCREEN DISPLAY (Image 2: "Touchscreen Display")
  // ==========================================
  // Crisp active display plane with CanvasTexture face
  const screenGeo = new THREE.PlaneGeometry(0.158, 0.088);
  disposables.push(screenGeo);
  const screenMat = new THREE.MeshBasicMaterial({
    map: options.faceTexture,
    toneMapped: false,
  });
  disposables.push(screenMat);
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, -0.01, 0.046);
  headMainGroup.add(screenMesh);

  // ==========================================
  // 8. SIDE SPEAKER PODS & LED HALO RINGS (Image 2: "Speaker")
  // ==========================================
  const createSpeakerPod = (isLeft: boolean): { group: THREE.Group; ledRing: THREE.Mesh } => {
    const speakerGroup = new THREE.Group();
    speakerGroup.position.set(isLeft ? 0.092 : -0.092, 0, 0);

    // Speaker housing base
    const housingGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.006, 28);
    housingGeo.rotateZ(Math.PI / 2);
    disposables.push(housingGeo);
    const housingMesh = new THREE.Mesh(housingGeo, darkAcrylicMat);
    speakerGroup.add(housingMesh);

    // Glowing Cyan LED Halo Ring (Image 2 clearly shows the circular blue ring on speaker)
    const ledRingGeo = new THREE.TorusGeometry(0.021, 0.0028, 12, 32);
    ledRingGeo.rotateY(Math.PI / 2);
    disposables.push(ledRingGeo);
    const ledRing = new THREE.Mesh(ledRingGeo, cyanLedMat);
    ledRing.position.set(isLeft ? 0.0035 : -0.0035, 0, 0);
    speakerGroup.add(ledRing);

    // Inner acoustic mesh grille
    const grilleGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.007, 24);
    grilleGeo.rotateZ(Math.PI / 2);
    disposables.push(grilleGeo);
    const grilleMesh = new THREE.Mesh(grilleGeo, darkMatteMat);
    speakerGroup.add(grilleMesh);

    return { group: speakerGroup, ledRing };
  };

  const leftSpeaker = createSpeakerPod(true);
  const rightSpeaker = createSpeakerPod(false);
  headMainGroup.add(leftSpeaker.group);
  headMainGroup.add(rightSpeaker.group);

  // ==========================================
  // 9. ULTRASONIC SENSOR BEAM VISUALIZATION
  // ==========================================
  const rayPoints = [new THREE.Vector3(0, 0.095, 0.095), new THREE.Vector3(0, 0.095, 0.85)];
  const rayGeo = new THREE.BufferGeometry().setFromPoints(rayPoints);
  disposables.push(rayGeo);
  const rayMat = new THREE.LineDashedMaterial({
    color: '#38bdf8',
    dashSize: 0.04,
    gapSize: 0.02,
    linewidth: 2,
  });
  disposables.push(rayMat);
  const ultrasonicRay = new THREE.Line(rayGeo, rayMat);
  ultrasonicRay.computeLineDistances();
  robotRoot.add(ultrasonicRay);

  // ==========================================
  // UPDATE METHOD
  // ==========================================
  const update = (state: RobotState, elapsed: number) => {
    // 1. Robot Base Pose (Odometry)
    robotRoot.position.x = state.odometry.x;
    robotRoot.position.z = state.odometry.z;
    robotRoot.rotation.y = (state.odometry.heading * Math.PI) / 180;

    // 2. Wheel Rotations (rolling with odometry)
    leftWheel.rotation.x = (state.odometry.leftWheelRotationDeg * Math.PI) / 180;
    rightWheel.rotation.x = (state.odometry.rightWheelRotationDeg * Math.PI) / 180;
    casterWheel.rotation.x = (state.odometry.leftWheelRotationDeg * Math.PI) / 180 * 2.8;

    // 3. Pan-Tilt Servos
    headServoGroup.rotation.y = (state.servo.panDeg * Math.PI) / 180;
    headTiltGroup.rotation.x = -(state.servo.tiltDeg * Math.PI) / 180;

    // 4. Dynamic LED Pulse Effects (breathing idle glow + speech reaction)
    const breath = 0.75 + 0.25 * Math.sin(elapsed * 2.2);
    const speechPulse = state.speechWaveform > 0.05 ? state.speechWaveform * 1.5 : 0;
    const ledIntensity = Math.min(2.0, breath + speechPulse);

    cyanLedMat.emissiveIntensity = ledIntensity;

    // 5. Ultrasonic Ray geometry & danger coloring
    const beamLengthM = Math.min(1.2, state.sensors.ultrasonicCm / 100);
    const positionAttr = ultrasonicRay.geometry.getAttribute('position');
    if (positionAttr) {
      positionAttr.setXYZ(0, 0, 0.095, 0.095);
      positionAttr.setXYZ(1, 0, 0.095, 0.095 + beamLengthM);
      positionAttr.needsUpdate = true;
    }
    ultrasonicRay.computeLineDistances();

    if (state.sensors.ultrasonicCm <= 20) {
      rayMat.color.set('#ef4444');
    } else if (state.sensors.ultrasonicCm <= 40) {
      rayMat.color.set('#f59e0b');
    } else {
      rayMat.color.set('#38bdf8');
    }
  };

  const dispose = () => {
    disposables.forEach((d) => d.dispose());
  };

  return {
    robotRoot,
    headServoGroup,
    headTiltGroup,
    leftWheel,
    rightWheel,
    casterWheel,
    screenMesh,
    ultrasonicRay,
    skirtLedMesh,
    chestLedBar,
    leftSpeakerLed: leftSpeaker.ledRing,
    rightSpeakerLed: rightSpeaker.ledRing,
    update,
    dispose,
  };
}
