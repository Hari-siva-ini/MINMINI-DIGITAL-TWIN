/**
 * MINMINI - Desktop Personal Care Robot Digital Twin
 * Engineering Type Definitions & Communication Schemas
 * Based on: "Design of a Desk Top Personal Care Robot (MINMINI)"
 */

export type RobotMode = 'simulation' | 'physical' | 'hybrid';

export type RobotActivity =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'moving'
  | 'following'
  | 'sleeping'
  | 'alert'
  | 'emergency'
  | 'offline'
  | 'low_battery'
  | 'error';

export type EmotionType =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'confused'
  | 'thinking'
  | 'listening'
  | 'speaking'
  | 'sleeping'
  | 'excited'
  | 'worried'
  | 'curious'
  | 'love'
  | 'tired'
  | 'bored'
  | 'focused'
  | 'celebrating'
  | 'error'
  | 'offline'
  | 'low_battery'
  | 'emergency';

export type RobotActionType =
  | 'idle'
  | 'forward'
  | 'backward'
  | 'left'
  | 'right'
  | 'stop'
  | 'rotate_left'
  | 'rotate_right'
  | 'head_left'
  | 'head_center'
  | 'head_right'
  | 'look_up'
  | 'look_down'
  | 'wave'
  | 'nod'
  | 'shake_head'
  | 'follow'
  | 'sit'
  | 'stand'
  | 'sleep'
  | 'wake'
  | 'listen'
  | 'think'
  | 'speak'
  | 'celebrate'
  | 'alert'
  | 'emergency_stop';

export const ALLOWED_ACTIONS: readonly RobotActionType[] = [
  'idle',
  'forward',
  'backward',
  'left',
  'right',
  'stop',
  'rotate_left',
  'rotate_right',
  'head_left',
  'head_center',
  'head_right',
  'look_up',
  'look_down',
  'wave',
  'nod',
  'shake_head',
  'follow',
  'sit',
  'stand',
  'sleep',
  'wake',
  'listen',
  'think',
  'speak',
  'celebrate',
  'alert',
  'emergency_stop',
] as const;

export type EyeDirection =
  | 'center'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'up_left'
  | 'up_right'
  | 'down_left'
  | 'down_right';

export type ScreenMode =
  | 'face'
  | 'chat'
  | 'notification'
  | 'clock'
  | 'calendar'
  | 'reminder'
  | 'status'
  | 'settings'
  | 'emergency'
  | 'low_battery'
  | 'sleep';

export type SyncStatus =
  | 'synced'
  | 'syncing'
  | 'out_of_sync'
  | 'physical_offline'
  | 'digital_offline'
  | 'error';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export type NotificationType =
  | 'info'
  | 'reminder'
  | 'warning'
  | 'success'
  | 'error'
  | 'emergency'
  | 'system'
  | 'ai'
  | 'battery'
  | 'network';

export type MemoryCategory =
  | 'profile'
  | 'preference'
  | 'fact'
  | 'reminder'
  | 'schedule'
  | 'task'
  | 'conversation'
  | 'event'
  | 'system'
  | 'important'
  | 'temporary';

export type MemoryImportance = 'low' | 'medium' | 'high' | 'critical';

export interface MemoryRecord {
  id: string;
  category: MemoryCategory;
  content: string;
  importance: MemoryImportance;
  created_at: string;
  updated_at: string;
  source: 'user_speech' | 'user_chat' | 'system' | 'ai_extracted';
  confidence: number;
  active: boolean;
  metadata?: Record<string, any>;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high';
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
  category: 'study' | 'personal' | 'care' | 'general';
  created_at: string;
  completed_at?: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  datetime: string;
  priority: NotificationPriority;
  repeat: 'none' | 'daily' | 'weekly';
  spoken: boolean;
  status: 'active' | 'triggered' | 'snoozed' | 'dismissed';
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  category: 'exam' | 'class' | 'study' | 'break' | 'personal';
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  preferredLanguage: 'English' | 'Tamil' | 'Tanglish';
  voiceStyle: 'friendly' | 'calm' | 'energetic' | 'academic' | 'elder_care';
  personality: 'friendly' | 'study_buddy' | 'professional' | 'elder_care' | 'playful';
  studySubject: string;
  examDate?: string;
  routine: {
    wakeTime: string;
    studyTime: string;
    sleepTime: string;
  };
  privacyMode: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

export interface SensorData {
  ultrasonicCm: number;
  irLeft: boolean; // true = clear, false = obstacle/edge
  irRight: boolean;
  temperatureC: number;
  imu: {
    roll: number;
    pitch: number;
    yaw: number;
  };
  batteryPct: number;
  batteryVoltage: number;
  batteryCurrent: number;
  charging: boolean;
  cpuLoadPct: number;
  ramUsageMb: number;
  fps: number;
}

export interface OdometryData {
  x: number;
  z: number;
  heading: number; // degrees
  distanceTravelledM: number;
  leftWheelRotationDeg: number;
  rightWheelRotationDeg: number;
  estimatedVelocityMps: number;
  leftMotorPwm: number;
  rightMotorPwm: number;
}

export interface ServoState {
  panDeg: number; // -75 to +75
  tiltDeg: number; // -30 to +40
  targetPanDeg: number;
  targetTiltDeg: number;
  speedDps: number;
}

export interface RobotState {
  robotId: string;
  mode: RobotMode;
  activity: RobotActivity;
  emotion: EmotionType;
  action: RobotActionType;
  screenMode: ScreenMode;
  eyeDirection: EyeDirection;
  speechWaveform: number; // 0 to 1
  isBlinking: boolean;
  emergencyStopped: boolean;
  obstacleDetected: boolean;
  obstacleDistanceCm: number;
  wifiConnected: boolean;
  wifiRssi: number;
  networkLatencyMs: number;
  aiProvider: 'glm' | 'gemini' | 'demo';
  aiModel: string;
  aiStatus: 'online' | 'thinking' | 'offline' | 'error';
  odometry: OdometryData;
  servo: ServoState;
  sensors: SensorData;
  syncStatus: SyncStatus;
  lastSyncTimestamp: string;
}

export interface AIStructuredResponse {
  response: string;
  emotion: EmotionType;
  action: RobotActionType;
  speak: boolean;
  priority?: 'normal' | 'high' | 'critical';
  duration?: number;
  target?: string;
  memory_update?: boolean;
  memory_text?: string;
  notification?: boolean;
  language?: 'English' | 'Tamil' | 'Tanglish';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'minmini' | 'system' | 'event';
  text: string;
  timestamp: string;
  emotion?: EmotionType;
  action?: RobotActionType;
  rawAI?: any;
  validated?: boolean;
}

export interface TelemetryPacket {
  robot_id: string;
  timestamp: string;
  battery: number;
  temperature: number;
  position: { x: number; z: number };
  heading: number;
  left_motor: number;
  right_motor: number;
  emotion: EmotionType;
  action: RobotActionType;
  ultrasonic: number;
  ir_left: boolean;
  ir_right: boolean;
  source: 'physical' | 'digital';
}

export interface SystemLogItem {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  module: string;
  message: string;
  details?: any;
}

export interface EvaluationMetric {
  id: string;
  name: string;
  category: string;
  target: string;
  targetValue: number;
  measuredValue: number;
  testCount: number;
  successCount: number;
  unit: string;
  status: 'passed' | 'testing' | 'target_met';
  paperSection: string;
}
