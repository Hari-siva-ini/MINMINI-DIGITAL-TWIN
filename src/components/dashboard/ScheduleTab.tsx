/**
 * MINMINI Study Buddy, Daily Routine, & Pomodoro Scheduler
 * Implements 25/5 min focus cycles with robot voice announcements,
 * task management, and academic exam countdowns.
 */
import React, { useEffect, useState } from 'react';
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ReminderItem, ScheduleEvent, TaskItem } from '../../types/minmini';
import { MemoryManager } from '../../services/memoryManager';
import { VoicePipelineService } from '../../services/voicePipeline';
import { RobotStateService } from '../../services/robotState';

export const ScheduleTab: React.FC = () => {
  const memoryMgr = MemoryManager.getInstance();
  const voiceService = VoicePipelineService.getInstance();
  const robotService = RobotStateService.getInstance();

  const [tasks, setTasks] = useState<TaskItem[]>(() => memoryMgr.getTasks());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => memoryMgr.getReminders());
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(() => memoryMgr.getSchedule());

  // Pomodoro Focus Timer State (Section 79: 25m study, 5m break)
  const [pomodoroMode, setPomodoroMode] = useState<'study' | 'break'>('study');
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // New task input
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    let timer: any;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      setIsRunning(false);
      if (pomodoroMode === 'study') {
        robotService.setEmotion('celebrating');
        robotService.executeAction('celebrate');
        voiceService.speak(
          'Excellent work! Your 25-minute study block is complete. Time for a 5-minute break.'
        );
        setPomodoroMode('break');
        setSecondsRemaining(5 * 60);
      } else {
        robotService.setEmotion('happy');
        voiceService.speak(
          'Break time is over. Ready to begin your next study focus session?'
        );
        setPomodoroMode('study');
        setSecondsRemaining(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining, pomodoroMode]);

  const toggleTimer = () => {
    if (!isRunning) {
      voiceService.speak(
        pomodoroMode === 'study'
          ? 'Pomodoro focus session initiated. MINMINI is keeping watch.'
          : 'Break timer active.'
      );
      robotService.setEmotion('focused');
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(pomodoroMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTask = (task: TaskItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    memoryMgr.updateTaskStatus(task.id, newStatus);
    setTasks(memoryMgr.getTasks());

    if (newStatus === 'completed') {
      robotService.setEmotion('celebrating');
      robotService.executeAction('nod');
      voiceService.speak(`Task completed: ${task.title}. Great progress!`);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    memoryMgr.addTask(newTaskTitle.trim());
    setTasks(memoryMgr.getTasks());
    setNewTaskTitle('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Pomodoro Study Buddy Card (Section 78 & 79) */}
      <div className="lg:col-span-5 bg-gradient-to-br from-slate-900/90 to-sky-950/30 rounded-2xl border border-sky-900/40 p-6 shadow-xl space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Study Buddy & Pomodoro Engine
                </h3>
                <p className="text-[11px] text-slate-400">
                  Verbal Audio Announcements & Distraction Free Mode
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                pomodoroMode === 'study'
                  ? 'bg-sky-950 text-sky-300 border border-sky-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {pomodoroMode === 'study' ? '25m Study Block' : '5m Rest Break'}
            </span>
          </div>

          {/* Large Clock Display */}
          <div className="text-center py-8">
            <div className="text-6xl font-mono font-extrabold tracking-tight text-slate-100 drop-shadow-md">
              {formatTime(secondsRemaining)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Current Subject: <span className="text-sky-300 font-semibold">Computer Networks</span>
            </p>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              id="btn-pomodoro-toggle"
              onClick={toggleTimer}
              className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Session' : 'Start Focus'}</span>
            </button>

            <button
              id="btn-pomodoro-reset"
              onClick={resetTimer}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Proactive Assistance Advice */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-sky-400">Proactive Care Tip:</span>
          <p>
            MINMINI monitors desk posture and prompts rest breaks. Screen face dims during deep focus intervals.
          </p>
        </div>
      </div>

      {/* Task & Exam Planner Column (Section 76 & 80) */}
      <div className="lg:col-span-7 space-y-5">
        {/* Task List Card */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Active Study & Care Tasks
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {tasks.filter((t) => t.status === 'completed').length} / {tasks.length} Completed
            </span>
          </div>

          {/* Add Task Input */}
          <form onSubmit={handleAddTask} className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder="Add revision task (e.g., 'Review TCP 3-way handshake')..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task)}
                className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  task.status === 'completed'
                    ? 'bg-slate-950/40 border-slate-800/50 text-slate-500 line-through'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-[11px] text-slate-400">{task.description}</div>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                    task.priority === 'high'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Calendar Schedule (Section 81 & 88) */}
        <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-slate-200">
                Daily Routine & Semester Events
              </h4>
            </div>
            <span className="text-xs text-slate-400">Arun Kumar Schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {schedule.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: evt.color }}
                  />
                  <span className="text-[11px] font-mono text-slate-400">
                    {evt.startTime} - {evt.endTime}
                  </span>
                </div>
                <div className="font-semibold text-slate-200">{evt.title}</div>
                <div className="text-[11px] text-slate-400">{evt.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
