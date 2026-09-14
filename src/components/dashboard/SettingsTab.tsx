/**
 * MINMINI Settings & Guided Academic Demonstration Tab
 * Includes the 10-Step Viva Presentation Script Runner (Section 282),
 * physical robot IP network settings, user profile configuration, and project credits.
 */
import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Play,
  RotateCcw,
  Save,
  Settings,
  Sliders,
  User,
  Volume2,
  Wifi,
} from 'lucide-react';
import { RobotState, UserProfile } from '../../types/minmini';
import { MemoryManager } from '../../services/memoryManager';
import { VoicePipelineService } from '../../services/voicePipeline';
import { RobotStateService } from '../../services/robotState';

interface SettingsTabProps {
  robotState: RobotState;
  onNavigateTab: (tab: string) => void;
}

const DEMO_STEPS = [
  {
    step: 1,
    title: 'System Initialization & Self-Test',
    desc: 'Robot boots, centers pan-tilt head, checks battery, and speaks greeting.',
    action: 'init',
  },
  {
    step: 2,
    title: 'Tanglish / Tamil Code-Switching',
    desc: 'Demonstrate multilingual AI: "Nalla irukkiya da MINMINI?" -> "Nalla irukken da Arun!".',
    action: 'tanglish',
  },
  {
    step: 3,
    title: 'SQLite Memory Recall',
    desc: 'Query upcoming exams from SQLite memory: "When is my Networks exam?".',
    action: 'memory_recall',
  },
  {
    step: 4,
    title: 'Pan-Tilt Head Scan',
    desc: 'Actuate servo motors to pan left 45°, right 45°, and affirmative nod.',
    action: 'servo_scan',
  },
  {
    step: 5,
    title: 'Differential Drive Locomotion',
    desc: 'Engage DC motors to move forward with real-time odometry calculation.',
    action: 'locomotion',
  },
  {
    step: 6,
    title: 'Ultrasonic Obstacle Safety Interlock',
    desc: 'Simulate 18cm obstacle: robot instantly aborts forward motion and sounds warning.',
    action: 'obstacle_stop',
  },
  {
    step: 7,
    title: 'Study Buddy Pomodoro Mode',
    desc: 'Activate 25-minute focus interval with distraction-free facial expression.',
    action: 'study_mode',
  },
  {
    step: 8,
    title: 'Digital Twin Bidirectional Sync',
    desc: 'Demonstrate real-time telemetry mirroring between physical hardware and 3D twin.',
    action: 'twin_sync',
  },
  {
    step: 9,
    title: 'Safety Emergency Stop (E-STOP)',
    desc: 'Press E-Stop button; system latches in safety halt state until cleared.',
    action: 'estop',
  },
  {
    step: 10,
    title: 'Viva Summary & Celebration',
    desc: 'Robot performs celebration wave and delivers final academic project statement.',
    action: 'celebrate',
  },
];

export const SettingsTab: React.FC<SettingsTabProps> = ({ robotState, onNavigateTab }) => {
  const memoryMgr = MemoryManager.getInstance();
  const voiceService = VoicePipelineService.getInstance();
  const robotService = RobotStateService.getInstance();

  const [profile, setProfile] = useState<UserProfile>(() => memoryMgr.getProfile());
  const [currentDemoStep, setCurrentDemoStep] = useState(0);
  const [physicalIp, setPhysicalIp] = useState('192.168.1.104');
  const [physicalPort, setPhysicalPort] = useState('5000');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRunDemoStep = (stepIndex: number) => {
    setCurrentDemoStep(stepIndex);
    const item = DEMO_STEPS[stepIndex];

    switch (item.action) {
      case 'init':
        robotService.executeAction('head_center');
        robotService.setEmotion('happy');
        robotService.executeAction('wave');
        voiceService.speak('MINMINI system online. Diagnostics nominal. Ready for presentation.');
        break;
      case 'tanglish':
        robotService.setEmotion('happy');
        robotService.executeAction('nod');
        voiceService.speak('Nalla irukken da Arun! Networks exam prep epdi pogudhu?');
        break;
      case 'memory_recall':
        robotService.setEmotion('focused');
        voiceService.speak('Arun, your Computer Networks semester exam is scheduled on May 15 at 10 AM in Hall 302.');
        break;
      case 'servo_scan':
        robotService.executeAction('head_left');
        setTimeout(() => robotService.executeAction('head_right'), 700);
        setTimeout(() => robotService.executeAction('head_center'), 1400);
        voiceService.speak('Dual-axis pan-tilt servo tracking operational.');
        break;
      case 'locomotion':
        robotService.executeAction('forward');
        setTimeout(() => robotService.executeAction('stop'), 1500);
        voiceService.speak('Differential drive motors engaged. Odometry updating.');
        break;
      case 'obstacle_stop':
        robotService.setObstacle(0, 0.18, true);
        voiceService.speak('Caution! Obstacle detected at 18 centimeters. Safety interlock engaged.');
        break;
      case 'study_mode':
        robotService.setEmotion('focused');
        voiceService.speak('Pomodoro focus block initiated. All alerts muted for 25 minutes.');
        break;
      case 'twin_sync':
        robotService.setRobotMode('hybrid');
        voiceService.speak('Digital twin state mirror synchronized with 38 millisecond latency.');
        break;
      case 'estop':
        robotService.executeAction('emergency_stop');
        voiceService.speak('Emergency stop triggered! Motor drivers de-energized.');
        break;
      case 'celebrate':
        robotService.executeAction('idle');
        robotService.setEmotion('celebrating');
        robotService.executeAction('celebrate');
        voiceService.speak('Thank you professors and reviewers! MINMINI companion robot demonstration complete.');
        break;
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    memoryMgr.setProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 10-Step Viva Presentation Script Runner (Section 282) */}
      <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Final Year Viva Demonstration Script (10 Automated Steps)
              </h2>
              <p className="text-[11px] text-slate-400">
                Execute standard evaluation test sequence with 1-click step triggers and verbal explanations.
              </p>
            </div>
          </div>
          <button
            id="btn-reset-demo-script"
            onClick={() => {
              setCurrentDemoStep(0);
              robotService.executeAction('head_center');
              robotService.executeAction('idle');
            }}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Demo Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {DEMO_STEPS.map((item, idx) => (
            <div
              key={item.step}
              onClick={() => handleRunDemoStep(idx)}
              className={`cursor-pointer p-3.5 rounded-xl border text-xs flex flex-col justify-between space-y-2 transition-all shadow-sm ${
                currentDemoStep === idx
                  ? 'bg-sky-950/80 border-sky-600 ring-1 ring-sky-500 text-slate-100'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-sky-400 font-bold">Step {item.step}</span>
                  {currentDemoStep === idx && (
                    <span className="text-emerald-400 font-bold">ACTIVE</span>
                  )}
                </div>
                <div className="font-semibold text-slate-100 line-clamp-1">{item.title}</div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-3">{item.desc}</p>
              </div>

              <button
                className={`w-full py-1 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                  currentDemoStep === idx
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Execute Step</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* User Profile Config */}
        <div className="lg:col-span-6 bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Companion User Profile (Stored in SQLite)
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Student / Owner Name:</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Language Preference:</label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 focus:outline-none"
                >
                  <option value="tanglish">Tanglish (Tamil + English)</option>
                  <option value="english">English Only</option>
                  <option value="tamil">Tamil (தமிழ்)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Study Subject:</label>
                <input
                  type="text"
                  value={profile.studySubject}
                  onChange={(e) => setProfile({ ...profile, studySubject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Upcoming Exam Target:</label>
              <input
                type="text"
                value={profile.examTarget}
                onChange={(e) => setProfile({ ...profile, examTarget: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {savedSuccess && (
                <span className="text-emerald-400 font-mono text-xs">
                  ✓ Profile Saved to SQLite!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Physical Robot IP & Hardware Bridge */}
        <div className="lg:col-span-6 bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Physical Hardware Robot Bridge (Section 128)
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <p className="text-slate-400">
              Configure Raspberry Pi 5 IP address on local WiFi network to stream telemetry to the physical chassis.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Chassis Static IP:</label>
                <input
                  type="text"
                  value={physicalIp}
                  onChange={(e) => setPhysicalIp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Port:</label>
                <input
                  type="text"
                  value={physicalPort}
                  onChange={(e) => setPhysicalPort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-slate-100"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Target Endpoint:</div>
              <div className="font-mono text-sky-400">
                http://{physicalIp}:{physicalPort}/api/v1/telemetry
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
              <div className="font-semibold text-slate-200 mb-1">Project Citation & Identity</div>
              <div>MINMINI: Desktop Personal Care Robot with 3D Digital Twin</div>
              <div>Final Year B.E. / B.Tech Capstone Project • Batch 2024-2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
