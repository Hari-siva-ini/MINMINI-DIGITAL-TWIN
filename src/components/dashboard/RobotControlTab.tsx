/**
 * MINMINI Teleoperation & Actuator Control Panel
 * Provides direct differential drive controls, pan-tilt servo joint adjustments,
 * odometry reset, and motor PWM teleoperation.
 */
import React, { useEffect } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Hand,
  Moon,
  Octagon,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Sliders,
  Smile,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { RobotState } from '../../types/minmini';
import { RobotStateService } from '../../services/robotState';

interface RobotControlTabProps {
  robotState: RobotState;
}

export const RobotControlTab: React.FC<RobotControlTabProps> = ({ robotState }) => {
  const robotService = RobotStateService.getInstance();

  // Keyboard Shortcuts (Section 228: W, S, A, D, Space, H, L, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'w':
          robotService.executeAction('forward');
          break;
        case 's':
          robotService.executeAction('backward');
          break;
        case 'a':
          robotService.executeAction('left');
          break;
        case 'd':
          robotService.executeAction('right');
          break;
        case ' ':
          robotService.executeAction('stop');
          break;
        case 'h':
          robotService.executeAction('head_center');
          break;
        case 'l':
          robotService.executeAction('head_left');
          break;
        case 'r':
          robotService.executeAction('head_right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Locomotion & Virtual D-Pad (Section 105 & 106) */}
      <div className="lg:col-span-6 bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Differential Drive Teleoperation
            </h3>
            <p className="text-[11px] text-slate-400">
              Left & Right Geared DC Motor Kinematics (WASD & Space Bar)
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            v = {robotState.odometry.estimatedVelocityMps.toFixed(2)} m/s
          </span>
        </div>

        {/* Directional Pad */}
        <div className="flex flex-col items-center justify-center py-4">
          <button
            id="btn-move-forward"
            onClick={() => robotService.executeAction('forward')}
            className="w-16 h-14 rounded-t-2xl bg-slate-800 hover:bg-sky-600 active:bg-sky-700 text-slate-100 flex items-center justify-center border border-slate-700 transition-colors shadow-md group"
            title="Forward (W)"
          >
            <ArrowUp className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-move-left"
              onClick={() => robotService.executeAction('left')}
              className="w-16 h-14 rounded-l-2xl bg-slate-800 hover:bg-sky-600 active:bg-sky-700 text-slate-100 flex items-center justify-center border border-slate-700 transition-colors shadow-md group"
              title="Steer Left (A)"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              id="btn-move-stop"
              onClick={() => robotService.executeAction('stop')}
              className="w-16 h-14 bg-red-950/80 hover:bg-red-800 text-red-300 flex items-center justify-center border border-red-800 transition-colors font-bold text-xs"
              title="Stop (Space)"
            >
              STOP
            </button>

            <button
              id="btn-move-right"
              onClick={() => robotService.executeAction('right')}
              className="w-16 h-14 rounded-r-2xl bg-slate-800 hover:bg-sky-600 active:bg-sky-700 text-slate-100 flex items-center justify-center border border-slate-700 transition-colors shadow-md group"
              title="Steer Right (D)"
            >
              <ArrowRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <button
            id="btn-move-backward"
            onClick={() => robotService.executeAction('backward')}
            className="w-16 h-14 rounded-b-2xl bg-slate-800 hover:bg-sky-600 active:bg-sky-700 text-slate-100 flex items-center justify-center border border-slate-700 transition-colors shadow-md group"
            title="Reverse (S)"
          >
            <ArrowDown className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Rotate In-Place Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            id="btn-rotate-left"
            onClick={() => robotService.executeAction('rotate_left')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Spin Left (45°)</span>
          </button>

          <button
            id="btn-rotate-right"
            onClick={() => robotService.executeAction('rotate_right')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 text-xs font-medium transition-colors"
          >
            <RotateCw className="w-4 h-4 text-sky-400" />
            <span>Spin Right (45°)</span>
          </button>
        </div>

        {/* Differential Wheel PWM Telemetry (Section 109) */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
          <div className="text-slate-400 font-medium">Motor Driver Telemetry (L298N/DRV8833 Class)</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500">Left Wheel PWM:</span>{' '}
              <span className="font-mono text-slate-200">{robotState.odometry.leftMotorPwm}</span> / 255
            </div>
            <div>
              <span className="text-slate-500">Right Wheel PWM:</span>{' '}
              <span className="font-mono text-slate-200">{robotState.odometry.rightMotorPwm}</span> / 255
            </div>
          </div>
        </div>
      </div>

      {/* Neck Pan-Tilt Servos & Odometry Dashboard (Section 108 & Section 09) */}
      <div className="lg:col-span-6 space-y-5">
        {/* Neck Servos Control Card */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Pan-Tilt Neck Servo Joints
              </h3>
              <p className="text-[11px] text-slate-400">
                Dual Axis High-Torque Micro Servos for Camera & Face Orientation
              </p>
            </div>
            <button
              id="btn-head-center"
              onClick={() => robotService.executeAction('head_center')}
              className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              title="Return Head to Center (H)"
            >
              Center (0°, 0°)
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Pan Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Pan Angle (Yaw: -65° Left to +65° Right):</span>
                <span className="font-mono text-sky-400 font-bold">
                  {robotState.servo.panDeg.toFixed(0)}°
                </span>
              </div>
              <input
                id="slider-head-pan"
                type="range"
                min={-65}
                max={65}
                value={robotState.servo.targetPanDeg}
                onChange={(e) =>
                  robotService.setHeadTarget(Number(e.target.value), robotState.servo.targetTiltDeg)
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Tilt Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Tilt Angle (Pitch: -25° Down to +35° Up):</span>
                <span className="font-mono text-sky-400 font-bold">
                  {robotState.servo.tiltDeg.toFixed(0)}°
                </span>
              </div>
              <input
                id="slider-head-tilt"
                type="range"
                min={-25}
                max={35}
                value={robotState.servo.targetTiltDeg}
                onChange={(e) =>
                  robotService.setHeadTarget(robotState.servo.targetPanDeg, Number(e.target.value))
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Quick Look Targets */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                id="btn-look-left"
                onClick={() => robotService.executeAction('head_left')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center"
              >
                Look Left
              </button>
              <button
                id="btn-look-right"
                onClick={() => robotService.executeAction('head_right')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center"
              >
                Look Right
              </button>
              <button
                id="btn-look-up"
                onClick={() => robotService.executeAction('look_up')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center"
              >
                Look Up
              </button>
              <button
                id="btn-look-down"
                onClick={() => robotService.executeAction('look_down')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center"
              >
                Look Down
              </button>
            </div>
          </div>
        </div>

        {/* Odometry & Kinematics Card (Section 09) */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Virtual Odometry Kinematics
              </h3>
            </div>
            <button
              id="btn-reset-odometry"
              onClick={() => robotService.resetOdometry()}
              className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>RESET ODOMETRY</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 text-[11px]">Coordinate X</span>
              <div className="font-mono text-sm font-semibold text-slate-100 mt-1">
                {robotState.odometry.x.toFixed(3)} m
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 text-[11px]">Coordinate Z</span>
              <div className="font-mono text-sm font-semibold text-slate-100 mt-1">
                {robotState.odometry.z.toFixed(3)} m
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 text-[11px]">Heading (θ)</span>
              <div className="font-mono text-sm font-semibold text-sky-400 mt-1">
                {robotState.odometry.heading.toFixed(1)}°
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
            <span>Total Odometry Distance:</span>
            <span className="font-mono font-bold text-slate-100">
              {robotState.odometry.distanceTravelledM.toFixed(2)} meters
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
