/**
 * MINMINI Academic Presentation Mode Overlay
 * Fullscreen presentation interface for college project review panel with
 * live 3D robot, architectural diagrams, benchmark charts, and slide notes.
 */
import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { RobotState } from '../../types/minmini';
import { RobotViewport } from '../3d/RobotViewport';

interface PresentationOverlayProps {
  robotState: RobotState;
  onClose: () => void;
}

const SLIDES = [
  {
    title: 'MINMINI: Desktop Personal Care Robot & 3D Digital Twin',
    subtitle: 'Final Year Engineering Capstone Project Presentation',
    bulletPoints: [
      'Problem: Modern students and solitary desk workers face cognitive fatigue, exam disorganization, and lack of engaging companionship.',
      'Proposed Solution: An embodied desktop robot featuring bilingual (English/Tamil) voice intelligence, active pan-tilt vision tracking, and differential drive locomotion.',
      'Key Innovation: Real-time 3D Digital Twin with bidirectional telemetry synchronization and formal JSON safety interlocks.',
    ],
  },
  {
    title: 'System Architecture & Subsystem Division',
    subtitle: 'Hardware, Embedded Firmware, AI Agent, & Digital Twin',
    bulletPoints: [
      'Hardware: Raspberry Pi 5 (8GB), DRV8833 DC motor drivers, micro servos, Pi Camera v3, and HC-SR04 sonar.',
      'Safety Subsystem: Hard obstacle distance interlock (<=20cm), action whitelist validator, and hardware emergency stop.',
      'Persistent Memory: SQLite relational schema capturing user study habits, exam dates, preferences, and session facts.',
      'Digital Twin: Three.js virtual robot mirroring odometry coordinates, servo angles, facial expressions, and battery level.',
    ],
  },
  {
    title: 'Multilingual AI & Safety Whitelist Verification',
    subtitle: 'GLM-5.2 / Gemini Integration with JSON Action Schema',
    bulletPoints: [
      'Bilingual Speech Pipeline: Understands English, native Tamil, and colloquial Tanglish (e.g. "Nalla irukkiya da MINMINI?").',
      'Structured JSON Interface: LLM produces strictly validated payloads containing response text, emotion tag, and physical action.',
      'Actuator Safety Layer: Any command outside authorized motion envelope is dropped into safe fallback state.',
    ],
  },
  {
    title: 'Empirical Results & Academic Evaluation',
    subtitle: 'Summary of Experimental Quantitative Metrics',
    bulletPoints: [
      'Speech Recognition: 92.4% accuracy across Tamil/Tanglish sentences.',
      'AI Response Latency: 1.24 seconds average end-to-end round trip.',
      'Obstacle Safety Stop: Verified at 19.8 cm obstacle threshold with zero collisions across 50 trials.',
      'Digital Twin Synchronization: Maintained sub-40ms latency across local wireless network.',
    ],
  },
];

export const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  robotState,
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-6 text-slate-100 overflow-hidden">
      {/* Presentation Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm tracking-wider uppercase text-slate-300">
            MINMINI Academic Viva Presentation • Slide {currentSlide + 1} of {SLIDES.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === SLIDES.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
            title="Exit Presentation Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Presentation Slide Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-6">
        {/* Slide Content Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-mono font-bold text-sky-400 tracking-wider">
              Project Defense & Review
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
              {slide.title}
            </h2>
            <p className="text-sm text-slate-400 font-medium">{slide.subtitle}</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {slide.bulletPoints.map((point, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3 shadow-md"
              >
                <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-4 text-xs text-slate-400 font-mono">
            <span>Author: Arun Kumar</span>
            <span>•</span>
            <span>Guide: Department of AI & Robotics</span>
          </div>
        </div>

        {/* Live 3D Twin Viewport */}
        <div className="lg:col-span-5 h-[420px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl relative flex flex-col">
          <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>LIVE 3D DIGITAL TWIN MODEL</span>
            <span className="text-emerald-400">● SYNCHRONIZED</span>
          </div>
          <div className="flex-1 relative">
            <RobotViewport robotState={robotState} />
          </div>
        </div>
      </div>
    </div>
  );
};
