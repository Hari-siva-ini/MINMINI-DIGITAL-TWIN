/**
 * MINMINI System Header & Global Status Bar
 * Displays Robot ID, Mode (Simulation/Physical/Hybrid), Battery, Network, Emotion, and Emergency Stop.
 */
import React from 'react';
import {
  Activity,
  AlertOctagon,
  Battery,
  BatteryCharging,
  Cpu,
  Radio,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { RobotMode, RobotState } from '../../types/minmini';
import { RobotStateService } from '../../services/robotState';

interface HeaderProps {
  robotState: RobotState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  presentationMode: boolean;
  setPresentationMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  robotState,
  activeTab,
  setActiveTab,
  presentationMode,
  setPresentationMode,
}) => {
  const robotService = RobotStateService.getInstance();

  const handleEStop = () => {
    if (robotState.emergencyStopped) {
      robotService.executeAction('idle');
    } else {
      robotService.executeAction('emergency_stop');
    }
  };

  const navItems = [
    { id: 'home', label: 'Overview' },
    { id: 'chat', label: 'AI Voice & Chat' },
    { id: 'control', label: 'Teleoperation' },
    { id: 'sensors', label: 'Sensors & Vision' },
    { id: 'memory', label: 'Memory (SQLite)' },
    { id: 'schedule', label: 'Study & Routine' },
    { id: 'twin', label: 'Digital Twin Sync' },
    { id: 'evaluation', label: 'Academic Evaluation' },
    { id: 'settings', label: 'Settings & Demo' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Branding & Identity (Section 01, 363, 364) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                MINMINI
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                Desktop Care Robot
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {robotState.robotId}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive 3D Digital Twin • Final Year Engineering Project
            </p>
          </div>
        </div>

        {/* Global Telemetry Chips */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 text-xs">
            {(['simulation', 'physical', 'hybrid'] as RobotMode[]).map((mode) => (
              <button
                key={mode}
                id={`btn-mode-${mode}`}
                onClick={() => robotService.setRobotMode(mode)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-all ${
                  robotState.mode === mode
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Battery Status */}
          <div
            onClick={() => robotService.toggleCharging()}
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
            title="Click to toggle simulated DC / USB-C charging"
          >
            {robotState.sensors.charging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Battery
                className={`w-4 h-4 ${
                  robotState.sensors.batteryPct < 20
                    ? 'text-red-400 animate-bounce'
                    : robotState.sensors.batteryPct < 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              />
            )}
            <span className="font-semibold text-slate-200">
              {robotState.sensors.batteryPct}%
            </span>
            <span className="text-[11px] text-slate-500 hidden md:inline">
              ({robotState.sensors.batteryVoltage}V)
            </span>
          </div>

          {/* WiFi & Sync Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            {robotState.wifiConnected ? (
              <Wifi className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            )}
            <span>{robotState.networkLatencyMs}ms</span>
          </div>

          {/* Emergency Stop Button (Section 53 & 298) */}
          <button
            id="btn-emergency-stop"
            onClick={handleEStop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              robotState.emergencyStopped
                ? 'bg-amber-500 text-slate-950 animate-pulse ring-2 ring-amber-400'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{robotState.emergencyStopped ? 'RESET E-STOP' : 'E-STOP'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar (Section 215) */}
      {!presentationMode && (
        <div className="border-t border-slate-800/80 bg-slate-900/40 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === item.id
                    ? 'bg-sky-950 text-sky-300 border border-sky-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="ml-auto pl-2 flex items-center gap-2">
              <button
                id="btn-presentation-mode-toggle"
                onClick={() => setPresentationMode(true)}
                className="px-2.5 py-1 rounded text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                title="Presentation Mode for final-year panel review"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Presentation Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
