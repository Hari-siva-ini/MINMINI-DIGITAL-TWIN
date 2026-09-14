/**
 * MINMINI Persistent Memory Layer (SQLite-compatible schema abstraction)
 * Manages user profile, preferences, schedule memories, and interaction logs.
 */
import {
  MemoryCategory,
  MemoryImportance,
  MemoryRecord,
  ReminderItem,
  ScheduleEvent,
  SystemLogItem,
  TaskItem,
  UserProfile,
} from '../types/minmini';

const STORAGE_KEYS = {
  MEMORIES: 'minmini_sqlite_memories_v1',
  TASKS: 'minmini_sqlite_tasks_v1',
  REMINDERS: 'minmini_sqlite_reminders_v1',
  SCHEDULE: 'minmini_sqlite_schedule_v1',
  USER_PROFILE: 'minmini_sqlite_profile_v1',
  LOGS: 'minmini_sqlite_logs_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'USER_001',
  name: 'Arun Kumar',
  nickname: 'Arun',
  preferredLanguage: 'English',
  voiceStyle: 'friendly',
  personality: 'study_buddy',
  studySubject: 'Computer Networks & Embedded Robotics',
  examDate: '2026-09-18',
  routine: {
    wakeTime: '07:00',
    studyTime: '17:00',
    sleepTime: '22:30',
  },
  privacyMode: false,
  micEnabled: true,
  cameraEnabled: true,
};

const DEFAULT_MEMORIES: MemoryRecord[] = [
  {
    id: 'mem_1',
    category: 'schedule',
    content: 'Final Year Engineering Computer Networks semester exam is next Friday at 10:00 AM in Hall 302.',
    importance: 'critical',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    source: 'user_speech',
    confidence: 0.98,
    active: true,
    metadata: { subject: 'Networks', type: 'exam' },
  },
  {
    id: 'mem_2',
    category: 'preference',
    content: 'User responds warmly to Tamil and Tanglish greetings like "nalla irukkiya da" or "va da padi da".',
    importance: 'high',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    source: 'ai_extracted',
    confidence: 0.95,
    active: true,
  },
  {
    id: 'mem_3',
    category: 'fact',
    content: 'User is building MINMINI: an interactive desktop personal care robot with Raspberry Pi 5 & Digital Twin.',
    importance: 'critical',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    source: 'system',
    confidence: 1.0,
    active: true,
  },
  {
    id: 'mem_4',
    category: 'reminder',
    content: 'Daily revision of ROS2 node architecture & HC-SR04 ultrasonic distance sensor calibration at 5:00 PM.',
    importance: 'high',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    source: 'user_chat',
    confidence: 0.94,
    active: true,
  },
  {
    id: 'mem_5',
    category: 'profile',
    content: 'Target study session interval is Pomodoro 25-min focus with 5-min break, verbal audio alert.',
    importance: 'medium',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    source: 'system',
    confidence: 0.99,
    active: true,
  },
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task_1',
    title: 'Review OSI 7-Layer Protocol Stack',
    description: 'Prepare revision notes for Computer Networks unit 2.',
    priority: 'high',
    deadline: '2026-09-15',
    status: 'in_progress',
    category: 'study',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_2',
    title: 'Calibrate Digital Twin Wheel Odometry',
    description: 'Validate differential drive forward kinematic displacement against virtual encoders.',
    priority: 'normal',
    deadline: '2026-09-16',
    status: 'pending',
    category: 'personal',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task_3',
    title: 'Test Obstacle Collision Stop Threshold (15cm)',
    description: 'Verify HC-SR04 ultrasonic safety auto-halt triggering.',
    priority: 'high',
    status: 'completed',
    category: 'care',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date().toISOString(),
  },
];

const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_1',
    title: 'Networks Exam Preparation Session',
    datetime: '17:00',
    priority: 'high',
    repeat: 'daily',
    spoken: true,
    status: 'active',
  },
  {
    id: 'rem_2',
    title: 'Hydration & Posture Check',
    datetime: '14:30',
    priority: 'normal',
    repeat: 'none',
    spoken: true,
    status: 'active',
  },
  {
    id: 'rem_3',
    title: 'MINMINI Battery Docking Recharge Reminder',
    datetime: '21:00',
    priority: 'high',
    repeat: 'daily',
    spoken: true,
    status: 'active',
  },
];

const DEFAULT_SCHEDULE: ScheduleEvent[] = [
  {
    id: 'sch_1',
    title: 'Morning Wakeup & Routine Care',
    description: 'Personal care greeting & ambient posture calibration.',
    startTime: '07:00',
    endTime: '08:00',
    date: 'Today',
    category: 'personal',
    color: '#3b82f6',
  },
  {
    id: 'sch_2',
    title: 'Robotics Laboratory Session',
    description: 'Motor driver PWM validation & Raspberry Pi 5 bench test.',
    startTime: '10:00',
    endTime: '12:30',
    date: 'Today',
    category: 'class',
    color: '#8b5cf6',
  },
  {
    id: 'sch_3',
    title: 'Computer Networks Revision Study',
    description: 'Exam preparation with MINMINI Study Buddy mode.',
    startTime: '17:00',
    endTime: '19:00',
    date: 'Today',
    category: 'study',
    color: '#10b981',
  },
  {
    id: 'sch_4',
    title: 'Networks Semester Exam',
    description: 'Final Year Hall 302 written evaluation.',
    startTime: '10:00',
    endTime: '13:00',
    date: 'Next Friday',
    category: 'exam',
    color: '#ef4444',
  },
];

export class MemoryManager {
  private static instance: MemoryManager;

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  public saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage', e);
    }
  }

  public setProfile(profile: UserProfile): void {
    this.saveProfile(profile);
  }

  public getMemories(): MemoryRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      if (!data) {
        this.saveMemories(DEFAULT_MEMORIES);
        return DEFAULT_MEMORIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_MEMORIES;
    }
  }

  public saveMemories(memories: MemoryRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.warn('Failed to save memories to localStorage', e);
    }
  }

  public addMemory(
    content: string,
    category: MemoryCategory = 'fact',
    importance: MemoryImportance = 'medium',
    source: MemoryRecord['source'] = 'user_chat'
  ): MemoryRecord {
    const memories = this.getMemories();
    const newRecord: MemoryRecord = {
      id: 'mem_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      category,
      content,
      importance,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source,
      confidence: 0.96,
      active: true,
    };
    memories.unshift(newRecord);
    this.saveMemories(memories);
    return newRecord;
  }

  public deleteMemory(id: string): void {
    const memories = this.getMemories().filter((m) => m.id !== id);
    this.saveMemories(memories);
  }

  public searchMemories(query: string, category?: MemoryCategory): MemoryRecord[] {
    const list = this.getMemories();
    const q = query.toLowerCase().trim();
    return list.filter((item) => {
      const matchCat = category ? item.category === category : true;
      const matchText = q ? item.content.toLowerCase().includes(q) : true;
      return matchCat && matchText && item.active;
    });
  }

  public getTasks(): TaskItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        this.saveTasks(DEFAULT_TASKS);
        return DEFAULT_TASKS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_TASKS;
    }
  }

  public saveTasks(tasks: TaskItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks', e);
    }
  }

  public addTask(title: string, description = '', priority: TaskItem['priority'] = 'normal'): TaskItem {
    const tasks = this.getTasks();
    const newTask: TaskItem = {
      id: 'task_' + Date.now(),
      title,
      description,
      priority,
      status: 'pending',
      category: 'study',
      created_at: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  public updateTaskStatus(id: string, status: TaskItem['status']): void {
    const tasks = this.getTasks().map((t) =>
      t.id === id
        ? {
            ...t,
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : undefined,
          }
        : t
    );
    this.saveTasks(tasks);
  }

  public deleteTask(id: string): void {
    this.saveTasks(this.getTasks().filter((t) => t.id !== id));
  }

  public getReminders(): ReminderItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (!data) {
        this.saveReminders(DEFAULT_REMINDERS);
        return DEFAULT_REMINDERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_REMINDERS;
    }
  }

  public saveReminders(reminders: ReminderItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Failed to save reminders', e);
    }
  }

  public addReminder(title: string, datetime: string, priority: ReminderItem['priority'] = 'normal'): ReminderItem {
    const reminders = this.getReminders();
    const item: ReminderItem = {
      id: 'rem_' + Date.now(),
      title,
      datetime,
      priority,
      repeat: 'none',
      spoken: true,
      status: 'active',
    };
    reminders.push(item);
    this.saveReminders(reminders);
    return item;
  }

  public getSchedule(): ScheduleEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      if (!data) {
        this.saveSchedule(DEFAULT_SCHEDULE);
        return DEFAULT_SCHEDULE;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SCHEDULE;
    }
  }

  public saveSchedule(events: ScheduleEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save schedule', e);
    }
  }

  public resetToDefaults(): void {
    this.saveProfile(DEFAULT_PROFILE);
    this.saveMemories(DEFAULT_MEMORIES);
    this.saveTasks(DEFAULT_TASKS);
    this.saveReminders(DEFAULT_REMINDERS);
    this.saveSchedule(DEFAULT_SCHEDULE);
  }

  public exportJSON(): string {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      profile: this.getProfile(),
      memories: this.getMemories(),
      tasks: this.getTasks(),
      reminders: this.getReminders(),
      schedule: this.getSchedule(),
    };
    return JSON.stringify(payload, null, 2);
  }
}
