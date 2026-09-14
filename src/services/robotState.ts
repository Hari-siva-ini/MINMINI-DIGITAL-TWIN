/**
 * MINMINI Central Robot State Controller & Physics/Odometry Simulation
 * Manages differential drive kinematics, pan-tilt servo joints, animated eye/face states,
 * sensors, battery consumption, and safety interlocks.
 */
import {
  AIStructuredResponse,
  EmotionType,
  EyeDirection,
  OdometryData,
  RobotActionType,
  RobotActivity,
  RobotMode,
  RobotState,
  ScreenMode,
  SensorData,
  ServoState,
  SyncStatus,
  TelemetryPacket,
} from '../types/minmini';

type StateListener = (state: RobotState) => void;
type TelemetryListener = (telemetry: TelemetryPacket) => void;

export class RobotStateService {
  private static instance: RobotStateService;

  private state: RobotState;
  private listeners: Set<StateListener> = new Set();
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private telemetryHistory: TelemetryPacket[] = [];

  // Motion physics variables
  private targetLinearVelocity = 0; // m/s (-0.3 to +0.3)
  private targetAngularVelocity = 0; // rad/s (-1.5 to +1.5)
  private currentLinearVelocity = 0;
  private currentAngularVelocity = 0;
  private maxLinearSpeed = 0.25; // m/s
  private maxAngularSpeed = 1.8; // rad/s
  private wheelRadius = 0.035; // 35mm wheel
  private trackWidth = 0.14; // 140mm wheelbase

  // Loop timer
  private intervalId: number | null = null;
  private lastUpdateTimestamp = performance.now();

  // Eye & blink control
  private nextBlinkTime = performance.now() + 3000;
  private blinkDuration = 160; // ms
  private isBlinking = false;
  private nextIdleGazeTime = performance.now() + 4000;

  // Obstacle placement in simulation world (x, z in meters)
  private obstaclePosition: { x: number; z: number; radius: number; enabled: boolean } = {
    x: 0,
    z: 0.8,
    radius: 0.12,
    enabled: true,
  };

  private constructor() {
    this.state = {
      robotId: 'MINMINI-001',
      mode: 'simulation',
      activity: 'idle',
      emotion: 'happy',
      action: 'idle',
      screenMode: 'face',
      eyeDirection: 'center',
      speechWaveform: 0,
      isBlinking: false,
      emergencyStopped: false,
      obstacleDetected: false,
      obstacleDistanceCm: 80,
      wifiConnected: true,
      wifiRssi: -54,
      networkLatencyMs: 38,
      aiProvider: 'glm',
      aiModel: 'GLM-5.2 (Academic Standard)',
      aiStatus: 'online',
      odometry: {
        x: 0,
        z: 0,
        heading: 0,
        distanceTravelledM: 0,
        leftWheelRotationDeg: 0,
        rightWheelRotationDeg: 0,
        estimatedVelocityMps: 0,
        leftMotorPwm: 0,
        rightMotorPwm: 0,
      },
      servo: {
        panDeg: 0,
        tiltDeg: 0,
        targetPanDeg: 0,
        targetTiltDeg: 0,
        speedDps: 85,
      },
      sensors: {
        ultrasonicCm: 80,
        irLeft: true,
        irRight: true,
        temperatureC: 38.4,
        imu: { roll: 0, pitch: 0, yaw: 0 },
        batteryPct: 88,
        batteryVoltage: 7.82,
        batteryCurrent: 0.42,
        charging: false,
        cpuLoadPct: 24,
        ramUsageMb: 580,
        fps: 60,
      },
      syncStatus: 'synced',
      lastSyncTimestamp: new Date().toISOString(),
    };

    this.startSimulationLoop();
  }

  public static getInstance(): RobotStateService {
    if (!RobotStateService.instance) {
      RobotStateService.instance = new RobotStateService();
    }
    return RobotStateService.instance;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    return () => {
      this.telemetryListeners.delete(listener);
    };
  }

  public getState(): RobotState {
    return { ...this.state };
  }

  public getTelemetryHistory(): TelemetryPacket[] {
    return [...this.telemetryHistory];
  }

  public getObstacle(): { x: number; z: number; radius: number; enabled: boolean } {
    return { ...this.obstaclePosition };
  }

  public setObstacle(x: number, z: number, enabled: boolean): void {
    this.obstaclePosition = { ...this.obstaclePosition, x, z, enabled };
    this.notify();
  }

  /**
   * Central command dispatcher with safety enforcement
   */
  public executeAction(action: RobotActionType, options?: { duration?: number; target?: string }): boolean {
    if (this.state.emergencyStopped && action !== 'emergency_stop' && action !== 'idle') {
      console.warn('Command blocked: MINMINI is in Emergency Stop state.');
      return false;
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'emergency_stop':
        this.state.emergencyStopped = true;
        this.targetLinearVelocity = 0;
        this.targetAngularVelocity = 0;
        this.state.action = 'emergency_stop';
        this.state.activity = 'emergency';
        this.state.emotion = 'emergency';
        this.state.screenMode = 'emergency';
        this.notify();
        return true;

      case 'stop':
      case 'idle':
        this.targetLinearVelocity = 0;
        this.targetAngularVelocity = 0;
        this.state.action = 'idle';
        this.state.activity = 'idle';
        if (this.state.emergencyStopped) {
          this.state.emergencyStopped = false;
          this.state.emotion = 'neutral';
          this.state.screenMode = 'face';
        }
        this.notify();
        return true;

      case 'forward':
        if (this.state.obstacleDetected && this.state.sensors.ultrasonicCm < 20) {
          console.warn('Forward motion blocked: Obstacle detected within safety threshold.');
          this.setEmotion('worried');
          return false;
        }
        this.targetLinearVelocity = this.maxLinearSpeed;
        this.targetAngularVelocity = 0;
        this.state.action = 'forward';
        this.state.activity = 'moving';
        this.notify();
        return true;

      case 'backward':
        this.targetLinearVelocity = -this.maxLinearSpeed * 0.75;
        this.targetAngularVelocity = 0;
        this.state.action = 'backward';
        this.state.activity = 'moving';
        this.notify();
        return true;

      case 'left':
      case 'rotate_left':
        this.targetLinearVelocity = action === 'left' ? this.maxLinearSpeed * 0.5 : 0;
        this.targetAngularVelocity = this.maxAngularSpeed;
        this.state.action = action;
        this.state.activity = 'moving';
        this.notify();
        return true;

      case 'right':
      case 'rotate_right':
        this.targetLinearVelocity = action === 'right' ? this.maxLinearSpeed * 0.5 : 0;
        this.targetAngularVelocity = -this.maxAngularSpeed;
        this.state.action = action;
        this.state.activity = 'moving';
        this.notify();
        return true;

      case 'head_left':
        this.setHeadTarget(35, this.state.servo.tiltDeg);
        this.state.action = 'head_left';
        this.notify();
        return true;

      case 'head_right':
        this.setHeadTarget(-35, this.state.servo.tiltDeg);
        this.state.action = 'head_right';
        this.notify();
        return true;

      case 'head_center':
        this.setHeadTarget(0, 0);
        this.state.action = 'head_center';
        this.notify();
        return true;

      case 'look_up':
        this.setHeadTarget(this.state.servo.panDeg, 25);
        this.state.action = 'look_up';
        this.notify();
        return true;

      case 'look_down':
        this.setHeadTarget(this.state.servo.panDeg, -20);
        this.state.action = 'look_down';
        this.notify();
        return true;

      case 'wave':
        this.state.action = 'wave';
        this.state.emotion = 'happy';
        this.performGestureWave();
        return true;

      case 'nod':
        this.state.action = 'nod';
        this.performGestureNod();
        return true;

      case 'shake_head':
        this.state.action = 'shake_head';
        this.performGestureShake();
        return true;

      case 'sleep':
        this.targetLinearVelocity = 0;
        this.targetAngularVelocity = 0;
        this.state.action = 'sleep';
        this.state.activity = 'sleeping';
        this.state.emotion = 'sleeping';
        this.state.screenMode = 'sleep';
        this.setHeadTarget(0, -15);
        this.notify();
        return true;

      case 'wake':
        this.state.action = 'wake';
        this.state.activity = 'idle';
        this.state.emotion = 'happy';
        this.state.screenMode = 'face';
        this.setHeadTarget(0, 0);
        this.notify();
        return true;

      case 'listen':
        this.state.activity = 'listening';
        this.state.emotion = 'listening';
        this.state.eyeDirection = 'center';
        this.notify();
        return true;

      case 'think':
        this.state.activity = 'thinking';
        this.state.emotion = 'thinking';
        this.setHeadTarget(12, 10);
        this.notify();
        return true;

      case 'speak':
        this.state.activity = 'speaking';
        this.state.emotion = 'speaking';
        this.notify();
        return true;

      case 'celebrate':
        this.state.action = 'celebrate';
        this.state.emotion = 'celebrating';
        this.performCelebration();
        return true;

      default:
        this.state.action = 'idle';
        this.notify();
        return true;
    }
  }

  public setEmotion(emotion: EmotionType): void {
    this.state.emotion = emotion;
    switch (emotion) {
      case 'happy':
      case 'excited':
      case 'love':
        this.state.eyeDirection = 'up';
        break;
      case 'sad':
      case 'tired':
        this.state.eyeDirection = 'down';
        break;
      case 'thinking':
        this.state.eyeDirection = 'up_right';
        break;
      case 'confused':
      case 'curious':
        this.state.eyeDirection = 'up_left';
        break;
      case 'emergency':
      case 'error':
        this.state.eyeDirection = 'center';
        this.state.screenMode = 'emergency';
        break;
      case 'sleeping':
        this.state.screenMode = 'sleep';
        break;
      default:
        this.state.eyeDirection = 'center';
        this.state.screenMode = 'face';
    }
    this.notify();
  }

  public setEyeDirection(dir: EyeDirection): void {
    this.state.eyeDirection = dir;
    this.notify();
  }

  public setScreenMode(mode: ScreenMode): void {
    this.state.screenMode = mode;
    this.notify();
  }

  public setHeadTarget(panDeg: number, tiltDeg: number): void {
    // Hardware constraints from MINMINI paper
    const clampedPan = Math.max(-65, Math.min(65, panDeg));
    const clampedTilt = Math.max(-25, Math.min(35, tiltDeg));
    this.state.servo.targetPanDeg = clampedPan;
    this.state.servo.targetTiltDeg = clampedTilt;
    this.notify();
  }

  public setSpeechWaveform(intensity: number): void {
    this.state.speechWaveform = Math.max(0, Math.min(1, intensity));
    this.notify();
  }

  public toggleCharging(): void {
    this.state.sensors.charging = !this.state.sensors.charging;
    if (this.state.sensors.charging) {
      this.targetLinearVelocity = 0;
      this.targetAngularVelocity = 0;
      this.state.activity = 'idle';
    }
    this.notify();
  }

  public setRobotMode(mode: RobotMode): void {
    this.state.mode = mode;
    this.state.syncStatus = mode === 'physical' ? 'syncing' : 'synced';
    this.notify();
  }

  public setActivity(activity: RobotActivity): void {
    this.state.activity = activity;
    this.notify();
  }

  public setPanTilt(panDeg: number, tiltDeg: number): void {
    this.setHeadTarget(panDeg, tiltDeg);
  }

  public teleportOdometry(x: number, z: number, heading: number): void {
    this.state.odometry.x = x;
    this.state.odometry.z = z;
    this.state.odometry.heading = heading;
    this.targetLinearVelocity = 0;
    this.targetAngularVelocity = 0;
    this.currentLinearVelocity = 0;
    this.currentAngularVelocity = 0;
    this.notify();
  }

  public resetOdometry(): void {
    this.state.odometry = {
      x: 0,
      z: 0,
      heading: 0,
      distanceTravelledM: 0,
      leftWheelRotationDeg: 0,
      rightWheelRotationDeg: 0,
      estimatedVelocityMps: 0,
      leftMotorPwm: 0,
      rightMotorPwm: 0,
    };
    this.targetLinearVelocity = 0;
    this.targetAngularVelocity = 0;
    this.currentLinearVelocity = 0;
    this.currentAngularVelocity = 0;
    this.notify();
  }

  public setBatteryPct(pct: number): void {
    this.state.sensors.batteryPct = Math.max(0, Math.min(100, pct));
    this.state.sensors.batteryVoltage = 6.4 + (this.state.sensors.batteryPct / 100) * 1.8;
    if (pct < 15) {
      this.state.activity = 'low_battery';
      this.state.emotion = 'low_battery';
    }
    this.notify();
  }

  // Gesture sequences
  private performGestureWave(): void {
    const originalPan = this.state.servo.panDeg;
    this.setHeadTarget(20, 15);
    setTimeout(() => this.setHeadTarget(-20, 15), 350);
    setTimeout(() => this.setHeadTarget(20, 15), 700);
    setTimeout(() => this.setHeadTarget(-20, 15), 1050);
    setTimeout(() => {
      this.setHeadTarget(originalPan, 0);
      this.state.action = 'idle';
      this.notify();
    }, 1400);
  }

  private performGestureNod(): void {
    this.setHeadTarget(this.state.servo.panDeg, 25);
    setTimeout(() => this.setHeadTarget(this.state.servo.panDeg, -15), 250);
    setTimeout(() => this.setHeadTarget(this.state.servo.panDeg, 20), 500);
    setTimeout(() => {
      this.setHeadTarget(this.state.servo.panDeg, 0);
      this.state.action = 'idle';
      this.notify();
    }, 750);
  }

  private performGestureShake(): void {
    this.setHeadTarget(30, 0);
    setTimeout(() => this.setHeadTarget(-30, 0), 220);
    setTimeout(() => this.setHeadTarget(25, 0), 440);
    setTimeout(() => {
      this.setHeadTarget(0, 0);
      this.state.action = 'idle';
      this.notify();
    }, 660);
  }

  private performCelebration(): void {
    this.setHeadTarget(15, 20);
    this.targetAngularVelocity = 2.0;
    setTimeout(() => {
      this.targetAngularVelocity = -2.0;
      this.setHeadTarget(-15, 20);
    }, 400);
    setTimeout(() => {
      this.targetAngularVelocity = 0;
      this.setHeadTarget(0, 0);
      this.state.action = 'idle';
      this.setEmotion('happy');
    }, 850);
  }

  /**
   * Main Physics & Kinematics simulation tick (runs at ~40Hz for smooth desktop simulation)
   */
  private startSimulationLoop(): void {
    if (this.intervalId) return;

    this.intervalId = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.06, (now - this.lastUpdateTimestamp) / 1000);
      this.lastUpdateTimestamp = now;

      // 1. Smooth velocity interpolation (acceleration/deceleration)
      const accelRate = 2.0; // m/s^2
      const angAccelRate = 6.0; // rad/s^2

      this.currentLinearVelocity += Math.max(
        -accelRate * dt,
        Math.min(accelRate * dt, this.targetLinearVelocity - this.currentLinearVelocity)
      );

      this.currentAngularVelocity += Math.max(
        -angAccelRate * dt,
        Math.min(angAccelRate * dt, this.targetAngularVelocity - this.currentAngularVelocity)
      );

      // 2. Differential drive forward kinematics
      const vLeft = this.currentLinearVelocity - (this.currentAngularVelocity * this.trackWidth) / 2;
      const vRight = this.currentLinearVelocity + (this.currentAngularVelocity * this.trackWidth) / 2;

      // Update heading (in degrees)
      const deltaThetaRad = this.currentAngularVelocity * dt;
      let headingDeg = this.state.odometry.heading + (deltaThetaRad * 180) / Math.PI;
      while (headingDeg > 180) headingDeg -= 360;
      while (headingDeg <= -180) headingDeg += 360;

      // Update position along heading vector
      const headingRad = (headingDeg * Math.PI) / 180;
      const deltaDist = this.currentLinearVelocity * dt;
      const dx = Math.sin(headingRad) * deltaDist;
      const dz = Math.cos(headingRad) * deltaDist;

      // Wheel rotations
      const leftRotDelta = ((vLeft * dt) / (2 * Math.PI * this.wheelRadius)) * 360;
      const rightRotDelta = ((vRight * dt) / (2 * Math.PI * this.wheelRadius)) * 360;

      // 3. Ultrasonic distance calculation to virtual obstacle
      let measuredUltrasonicCm = 95;
      let obstacleInBeam = false;

      if (this.obstaclePosition.enabled) {
        // Distance from robot (x, z) to obstacle (ox, oz)
        const rx = this.state.odometry.x;
        const rz = this.state.odometry.z;
        const ox = this.obstaclePosition.x;
        const oz = this.obstaclePosition.z;

        const distToObstacle = Math.hypot(ox - rx, oz - rz) - this.obstaclePosition.radius - 0.08;
        const angleToObstacleRad = Math.atan2(ox - rx, oz - rz);
        let angleDiffDeg = ((angleToObstacleRad - headingRad) * 180) / Math.PI;
        while (angleDiffDeg > 180) angleDiffDeg -= 360;
        while (angleDiffDeg <= -180) angleDiffDeg += 360;

        // HC-SR04 ultrasonic cone: ~30 degrees wide
        if (Math.abs(angleDiffDeg) < 22 && distToObstacle >= 0 && distToObstacle < 2.5) {
          measuredUltrasonicCm = Math.round(distToObstacle * 100);
          obstacleInBeam = true;
        }
      }

      // 4. Safety Interlock: Automatic stop on danger collision threshold (< 18cm)
      let obstacleDetected = false;
      if (measuredUltrasonicCm <= 22) {
        obstacleDetected = true;
        if (this.currentLinearVelocity > 0) {
          // Force stop
          this.targetLinearVelocity = 0;
          this.currentLinearVelocity = 0;
          this.state.action = 'alert';
          this.state.activity = 'alert';
          this.state.emotion = 'worried';
        }
      }

      // 5. Servo interpolation (pan & tilt)
      const servoSpeed = this.state.servo.speedDps * dt;
      let currentPan = this.state.servo.panDeg;
      let currentTilt = this.state.servo.tiltDeg;

      if (Math.abs(this.state.servo.targetPanDeg - currentPan) > 0.5) {
        const step = Math.sign(this.state.servo.targetPanDeg - currentPan) * servoSpeed;
        currentPan += Math.abs(this.state.servo.targetPanDeg - currentPan) < Math.abs(step)
          ? this.state.servo.targetPanDeg - currentPan
          : step;
      }
      if (Math.abs(this.state.servo.targetTiltDeg - currentTilt) > 0.5) {
        const step = Math.sign(this.state.servo.targetTiltDeg - currentTilt) * servoSpeed;
        currentTilt += Math.abs(this.state.servo.targetTiltDeg - currentTilt) < Math.abs(step)
          ? this.state.servo.targetTiltDeg - currentTilt
          : step;
      }

      // 6. Natural blinking logic
      if (now >= this.nextBlinkTime) {
        this.isBlinking = true;
        if (now >= this.nextBlinkTime + this.blinkDuration) {
          this.isBlinking = false;
          // Variable blink interval (2.5 to 5.5 seconds) with occasional double-blink
          const isDoubleBlink = Math.random() < 0.25;
          this.nextBlinkTime = now + (isDoubleBlink ? 300 : 2500 + Math.random() * 3200);
        }
      } else {
        this.isBlinking = false;
      }

      // 7. Idle eye micro-movements
      if (now >= this.nextIdleGazeTime && this.state.activity === 'idle' && this.state.emotion === 'neutral') {
        const directions: EyeDirection[] = ['center', 'center', 'left', 'right', 'up', 'center'];
        this.state.eyeDirection = directions[Math.floor(Math.random() * directions.length)];
        this.nextIdleGazeTime = now + 2500 + Math.random() * 3000;
      }

      // 8. Battery drain & charging model
      let currentBattery = this.state.sensors.batteryPct;
      if (this.state.sensors.charging) {
        currentBattery = Math.min(100, currentBattery + 0.08 * dt * 5); // Fast charging demo
      } else {
        // Drain depends on activity
        let drainMultiplier = 0.005; // Idle
        if (Math.abs(this.currentLinearVelocity) > 0.05 || Math.abs(this.currentAngularVelocity) > 0.1) {
          drainMultiplier += 0.035; // Motors
        }
        if (this.state.activity === 'speaking' || this.state.activity === 'listening') {
          drainMultiplier += 0.02; // Audio & AI
        }
        currentBattery = Math.max(0, currentBattery - drainMultiplier * dt);
      }

      // 9. Commit updated state
      this.state = {
        ...this.state,
        isBlinking: this.isBlinking,
        obstacleDetected,
        obstacleDistanceCm: measuredUltrasonicCm,
        odometry: {
          x: this.state.odometry.x + dx,
          z: this.state.odometry.z + dz,
          heading: headingDeg,
          distanceTravelledM: this.state.odometry.distanceTravelledM + Math.abs(deltaDist),
          leftWheelRotationDeg: this.state.odometry.leftWheelRotationDeg + leftRotDelta,
          rightWheelRotationDeg: this.state.odometry.rightWheelRotationDeg + rightRotDelta,
          estimatedVelocityMps: Math.round(this.currentLinearVelocity * 100) / 100,
          leftMotorPwm: Math.round((vLeft / this.maxLinearSpeed) * 255),
          rightMotorPwm: Math.round((vRight / this.maxLinearSpeed) * 255),
        },
        servo: {
          ...this.state.servo,
          panDeg: Math.round(currentPan * 10) / 10,
          tiltDeg: Math.round(currentTilt * 10) / 10,
        },
        sensors: {
          ...this.state.sensors,
          ultrasonicCm: measuredUltrasonicCm,
          batteryPct: Math.round(currentBattery * 10) / 10,
          batteryVoltage: Math.round((6.4 + (currentBattery / 100) * 1.8) * 100) / 100,
          batteryCurrent: Math.round((0.35 + Math.abs(this.currentLinearVelocity) * 0.8) * 100) / 100,
          temperatureC: Math.round((38.2 + (this.state.sensors.cpuLoadPct / 100) * 8.5) * 10) / 10,
          imu: {
            roll: Math.round(Math.sin(now * 0.003) * 0.4 * 10) / 10,
            pitch: Math.round((this.currentLinearVelocity * 4 + currentTilt * 0.1) * 10) / 10,
            yaw: Math.round(headingDeg * 10) / 10,
          },
        },
      };

      // Periodic telemetry emission (every ~1s)
      if (Math.random() < 0.05) {
        this.emitTelemetry();
      }

      this.notify();
    }, 30);
  }

  private emitTelemetry(): void {
    const packet: TelemetryPacket = {
      robot_id: this.state.robotId,
      timestamp: new Date().toISOString(),
      battery: this.state.sensors.batteryPct,
      temperature: this.state.sensors.temperatureC,
      position: {
        x: Math.round(this.state.odometry.x * 100) / 100,
        z: Math.round(this.state.odometry.z * 100) / 100,
      },
      heading: Math.round(this.state.odometry.heading),
      left_motor: Math.round((this.state.odometry.leftMotorPwm / 255) * 100) / 100,
      right_motor: Math.round((this.state.odometry.rightMotorPwm / 255) * 100) / 100,
      emotion: this.state.emotion,
      action: this.state.action,
      ultrasonic: this.state.sensors.ultrasonicCm,
      ir_left: this.state.sensors.irLeft,
      ir_right: this.state.sensors.irRight,
      source: this.state.mode === 'physical' ? 'physical' : 'digital',
    };

    this.telemetryHistory.unshift(packet);
    if (this.telemetryHistory.length > 50) {
      this.telemetryHistory.pop();
    }

    this.telemetryListeners.forEach((listener) => listener(packet));
  }

  private notify(): void {
    const copy = { ...this.state };
    this.listeners.forEach((listener) => listener(copy));
  }
}
