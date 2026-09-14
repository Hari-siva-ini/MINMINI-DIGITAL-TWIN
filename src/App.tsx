/**
 * MINMINI - Desktop Personal Care Robot & 3D Digital Twin
 * Main Application Root Component
 */
import React, { useEffect, useState } from 'react';
import { RobotState } from './types/minmini';
import { RobotStateService } from './services/robotState';
import { Header } from './components/common/Header';
import { HomeTab } from './components/dashboard/HomeTab';
import { ChatTab } from './components/dashboard/ChatTab';
import { RobotControlTab } from './components/dashboard/RobotControlTab';
import { SensorsTab } from './components/dashboard/SensorsTab';
import { MemoryTab } from './components/dashboard/MemoryTab';
import { ScheduleTab } from './components/dashboard/ScheduleTab';
import { DigitalTwinSyncTab } from './components/dashboard/DigitalTwinSyncTab';
import { EvaluationTab } from './components/dashboard/EvaluationTab';
import { SettingsTab } from './components/dashboard/SettingsTab';
import { PresentationOverlay } from './components/common/PresentationOverlay';

export default function App() {
  const robotService = RobotStateService.getInstance();
  const [robotState, setRobotState] = useState<RobotState>(() => robotService.getState());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [presentationMode, setPresentationMode] = useState<boolean>(false);

  useEffect(() => {
    const unsub = robotService.subscribe((state) => {
      setRobotState(state);
    });
    return () => unsub();
  }, [robotService]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white font-sans antialiased">
      {/* Global Navigation Header */}
      <Header
        robotState={robotState}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
      />

      {/* Emergency Stop Banner Alert (Section 53) */}
      {robotState.emergencyStopped && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 animate-pulse sticky top-[61px] z-40 shadow-lg">
          <span>⚠️ EMERGENCY STOP ACTIVE: MOTORS DISENGAGED & MOTION HALTED</span>
          <button
            onClick={() => robotService.executeAction('idle')}
            className="underline hover:text-red-200 ml-2"
          >
            Click to clear and re-arm
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* {activeTab === 'home' && (
          <HomeTab robotState={robotState} onNavigateTab={setActiveTab} />
        )} */}
        {<HomeTab robotState={robotState} onNavigateTab={setActiveTab} />}
        {activeTab === 'chat' && <ChatTab robotState={robotState} />}
        {activeTab === 'control' && <RobotControlTab robotState={robotState} />}
        {activeTab === 'sensors' && <SensorsTab robotState={robotState} />}
        {activeTab === 'memory' && <MemoryTab />}
        {activeTab === 'schedule' && <ScheduleTab />}
        {activeTab === 'twin' && <DigitalTwinSyncTab robotState={robotState} />}
        {activeTab === 'evaluation' && <EvaluationTab robotState={robotState} />}
        {activeTab === 'settings' && (
          <SettingsTab robotState={robotState} onNavigateTab={setActiveTab} />
        )}
      </main>

      {/* Presentation Mode Fullscreen Overlay */}
      {presentationMode && (
        <PresentationOverlay
          robotState={robotState}
          onClose={() => setPresentationMode(false)}
        />
      )}

      {/* Footer System Status Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 sm:px-6 py-2.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">MINMINI ROS2 / Digital Twin Core v2.4</span>
            <span>•</span>
            <span>GLM-5.2 Academic Edition</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Model: Desktop Bipedal-Wheel Hybrid</span>
            <span>OS: Ubuntu 24.04 LTS (RPi 5)</span>
            <span className="font-mono text-sky-400">FPS: ~40</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
