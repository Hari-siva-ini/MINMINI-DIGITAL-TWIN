/**
 * MINMINI Sensor Dashboard & Computer Vision Panel
 * Visualizes HC-SR04 ultrasonic readings, IR proximity, 6-DoF IMU orientation,
 * battery health, and simulated Pi Camera v3 with AI object detection overlays.
 */
import React from 'react';
import {
  Activity,
  AlertTriangle,
  Battery,
  Camera,
  Cpu,
  Eye,
  Layers,
  Radio,
  Scan,
  ShieldAlert,
  Thermometer,
  Zap,
} from 'lucide-react';
import { RobotState } from '../../types/minmini';
import { RobotStateService } from '../../services/robotState';

interface SensorsTabProps {
  robotState: RobotState;
}

export const SensorsTab: React.FC<SensorsTabProps> = ({ robotState }) => {
  const robotService = RobotStateService.getInstance();
  const obstacle = robotService.getObstacle();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Simulated Pi Camera v3 & Vision Panel (Section 32, 33, 147) */}
      <div className="lg:col-span-7 bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Raspberry Pi Camera v3 Stream (Simulated)
              </h3>
              <p className="text-[11px] text-slate-400">
                1080p Desktop Vision • Face & Object Tracking Pipeline
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              VISION 30 FPS
            </span>
          </div>
        </div>

        {/* Viewfinder Frame with AI Detection Bounding Boxes */}
        <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner group">
          {/* Simulated desk background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* User Face Detection Box (Section 34: Face recognition placeholder) */}
          <div className="absolute top-[20%] left-[32%] w-44 h-48 border-2 border-emerald-400/80 rounded-lg p-1.5 bg-emerald-500/10 backdrop-blur-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold bg-emerald-950/90 text-emerald-300 px-1.5 py-0.5 rounded">
              <span>USER: Arun Kumar</span>
              <span>96.4%</span>
            </div>
            <div className="text-[9px] font-mono text-emerald-400/80 bg-slate-950/80 px-1 rounded self-start">
              ID: USER_001
            </div>
          </div>

          {/* Detected Study Material Box */}
          <div className="absolute bottom-[18%] right-[15%] w-36 h-28 border border-sky-400/70 rounded p-1 bg-sky-500/10">
            <span className="text-[9px] font-mono font-semibold bg-sky-950/90 text-sky-300 px-1 py-0.5 rounded">
              Book: Networks
            </span>
          </div>

          {/* Crosshair HUD */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
            <Scan className="w-16 h-16 text-sky-400" />
          </div>

          {/* Camera Info Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/85 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300 border border-slate-700/60 flex items-center gap-3">
            <span>RES: 1920x1080</span>
            <span>FOVH: 66°</span>
            <span>EXP: AUTO</span>
          </div>
        </div>

        {/* Vision Pipeline Status */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-slate-500 text-[11px]">Person Detection</div>
            <div className="text-emerald-400 font-semibold font-mono mt-0.5">DETECTED (1)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-slate-500 text-[11px]">Attention Target</div>
            <div className="text-slate-200 font-semibold font-mono mt-0.5">USER_HEAD</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-slate-500 text-[11px]">Inference Time</div>
            <div className="text-slate-200 font-semibold font-mono mt-0.5">24.2 ms</div>
          </div>
        </div>
      </div>

      {/* Ultrasonic Distance & Hardware Sensors Panel (Section 49, 50, 51) */}
      <div className="lg:col-span-5 space-y-5">
        {/* Ultrasonic Radar Card */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                HC-SR04 Ultrasonic Sensor
              </h3>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                robotState.sensors.ultrasonicCm < 20
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : robotState.sensors.ultrasonicCm < 40
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {robotState.sensors.ultrasonicCm < 20
                ? 'COLLISION DANGER'
                : robotState.sensors.ultrasonicCm < 40
                ? 'CAUTION ZONE'
                : 'SAFE CLEARANCE'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
            <div className="text-slate-400 text-xs uppercase tracking-wider">
              Measured Frontal Distance
            </div>
            <div
              className={`text-4xl font-mono font-extrabold tracking-tight ${
                robotState.sensors.ultrasonicCm < 20
                  ? 'text-red-400'
                  : robotState.sensors.ultrasonicCm < 40
                  ? 'text-amber-400'
                  : 'text-sky-400'
              }`}
            >
              {robotState.sensors.ultrasonicCm}{' '}
              <span className="text-lg font-normal text-slate-400">cm</span>
            </div>

            {/* Threshold Bar Graph */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full transition-all duration-300 ${
                  robotState.sensors.ultrasonicCm < 20
                    ? 'bg-red-500'
                    : robotState.sensors.ultrasonicCm < 40
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
                style={{
                  width: `${Math.min(100, (robotState.sensors.ultrasonicCm / 100) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>0 cm (Stop)</span>
              <span>20 cm (Danger)</span>
              <span>40 cm (Caution)</span>
              <span>100+ cm</span>
            </div>
          </div>

          {/* Quick distance injection slider for testing (Section 317) */}
          <div className="text-xs space-y-1.5 pt-1">
            <div className="flex justify-between text-slate-300">
              <span className="text-[11px] text-slate-400">Adjust Virtual Obstacle Distance:</span>
              <span className="font-mono text-sky-400">
                {(obstacle.z * 100).toFixed(0)} cm
              </span>
            </div>
            <input
              id="slider-obstacle-distance"
              type="range"
              min={0.15}
              max={1.5}
              step={0.02}
              value={obstacle.z}
              onChange={(e) =>
                robotService.setObstacle(obstacle.x, Number(e.target.value), true)
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>

        {/* IMU & Proximity Sensors (Section 50) */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3.5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            IMU & Secondary Perception
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* IMU Roll Pitch Yaw */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px] font-medium">MPU6050 6-DoF IMU</div>
              <div className="font-mono text-slate-300">Roll: {robotState.sensors.imu.roll}°</div>
              <div className="font-mono text-slate-300">Pitch: {robotState.sensors.imu.pitch}°</div>
              <div className="font-mono text-slate-300">Yaw: {robotState.sensors.imu.yaw}°</div>
            </div>

            {/* Infrared Edge Proximity Sensors */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 text-[11px] font-medium">IR Table Edge Sensors</div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Left IR:</span>
                <span className="text-emerald-400 font-mono font-bold">SURFACE OK</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Right IR:</span>
                <span className="text-emerald-400 font-mono font-bold">SURFACE OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
