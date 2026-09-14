/**
 * MINMINI Home / Overview Dashboard Tab
 * Integrates real-time 3D Digital Twin viewport with status cards, quick action triggers,
 * ultrasonic distance monitor, and upcoming schedule alerts.
 */
import React from 'react';
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  Compass,
  Eye,
  Hand,
  Moon,
  Play,
  RotateCcw,
  ShieldCheck,
  Smile,
  Volume2,
  Zap,
} from 'lucide-react';
import { RobotState } from '../../types/minmini';
import { RobotStateService } from '../../services/robotState';
import { VoicePipelineService } from '../../services/voicePipeline';
import { RobotViewport } from '../3d/RobotViewport';
import { MemoryManager } from '../../services/memoryManager';

interface HomeTabProps {
  robotState: RobotState;
  onNavigateTab: (tab: string) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ robotState, onNavigateTab }) => {
  const robotService = RobotStateService.getInstance();
  const voiceService = VoicePipelineService.getInstance();
  const memoryMgr = MemoryManager.getInstance();

  const userProfile = memoryMgr.getProfile();
  const reminders = memoryMgr.getReminders();
  const nextReminder = reminders.find((r) => r.status === 'active');
  const tasks = memoryMgr.getTasks();
  const activeTask = tasks.find((t) => t.status !== 'completed');

  const handleQuickGreeting = () => {
    robotService.setEmotion('happy');
    robotService.executeAction('wave');
    voiceService.speak(
      `Hello ${userProfile.name}! MINMINI is active and synchronized with your digital twin.`
    );
  };

  const handleStudyStart = () => {
    robotService.setEmotion('focused');
    robotService.executeAction('nod');
    voiceService.speak(
      `Starting Pomodoro study session for ${userProfile.studySubject}. Muting distractions.`
    );
    onNavigateTab('schedule');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 3D Digital Twin Viewport Card (Section 104) */}
      <div className="lg:col-span-8 bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col h-[520px]">
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              MINMINI 3D Digital Twin Simulation
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Activity:</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 font-mono capitalize">
              {robotState.activity}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono capitalize">
              Emotion: {robotState.emotion}
            </span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <RobotViewport robotState={robotState} />
        </div>
      </div>

      {/* Side Status & Quick Assistant Panel */}
      <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
        {/* State Overview Card */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Robot Telemetry State
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                robotState.syncStatus === 'synced'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              ● {robotState.syncStatus.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Odometry Pose</div>
              <div className="text-slate-100 font-semibold font-mono mt-0.5">
                X: {robotState.odometry.x.toFixed(2)}m
              </div>
              <div className="text-slate-100 font-semibold font-mono">
                Z: {robotState.odometry.z.toFixed(2)}m
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Heading & Pan</div>
              <div className="text-slate-100 font-semibold font-mono mt-0.5">
                θ: {robotState.odometry.heading.toFixed(1)}°
              </div>
              <div className="text-slate-100 font-semibold font-mono">
                Neck: {robotState.servo.panDeg.toFixed(0)}°
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">Ultrasonic Sensor</div>
              <div
                className={`font-mono font-bold mt-0.5 text-sm ${
                  robotState.sensors.ultrasonicCm < 20
                    ? 'text-red-400'
                    : robotState.sensors.ultrasonicCm < 40
                    ? 'text-amber-400'
                    : 'text-sky-400'
                }`}
              >
                {robotState.sensors.ultrasonicCm} cm
              </div>
              <div className="text-[10px] text-slate-500">
                {robotState.sensors.ultrasonicCm < 20 ? 'DANGER STOP' : 'CLEAR'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-slate-400 text-[11px]">RPi 5 Core Temp</div>
              <div className="text-slate-100 font-semibold font-mono mt-0.5 text-sm">
                {robotState.sensors.temperatureC}°C
              </div>
              <div className="text-[10px] text-slate-500">CPU: {robotState.sensors.cpuLoadPct}%</div>
            </div>
          </div>
        </div>

        {/* Active Study & Reminder Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-900/80 border border-sky-900/40 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Next Upcoming Reminder
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-300">
              {nextReminder ? nextReminder.datetime : 'None'}
            </span>
          </div>

          <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            {nextReminder ? (
              <p className="font-medium text-slate-200">{nextReminder.title}</p>
            ) : (
              <p className="text-slate-400">All scheduled tasks completed.</p>
            )}
            {activeTask && (
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                Current Task: <span className="text-sky-300">{activeTask.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Interaction Buttons (Section 105) */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md space-y-2.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Robot Interactions
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              id="btn-quick-greet"
              onClick={handleQuickGreeting}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Hand className="w-4 h-4 text-sky-400" />
              <span>Wave & Greet</span>
            </button>

            <button
              id="btn-quick-study"
              onClick={handleStudyStart}
              className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Study Buddy</span>
            </button>

            <button
              id="btn-quick-nod"
              onClick={() => {
                robotService.executeAction('nod');
                robotService.setEmotion('happy');
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Smile className="w-4 h-4 text-emerald-400" />
              <span>Affirmative Nod</span>
            </button>

            <button
              id="btn-quick-sleep"
              onClick={() => {
                if (robotState.activity === 'sleeping') {
                  robotService.executeAction('wake');
                } else {
                  robotService.executeAction('sleep');
                }
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Moon className="w-4 h-4 text-purple-400" />
              <span>{robotState.activity === 'sleeping' ? 'Wake Robot' : 'Sleep Mode'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
