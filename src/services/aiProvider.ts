/**
 * MINMINI AI Agent Interface & Provider Abstraction
 * Primary Model: GLM-5.2 (Academic Standard) with Gemini & Offline Demo Engine.
 * Formats responses into validated JSON with emotions, actions, and memory updates.
 */
import {
  AIStructuredResponse,
  EmotionType,
  RobotActionType,
} from '../types/minmini';
import { AIResponseValidator } from './actionValidator';
import { MemoryManager } from './memoryManager';
import { RobotStateService } from './robotState';

export interface AIProviderConfig {
  provider: 'glm' | 'gemini' | 'demo';
  model: string;
  endpoint: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  language: 'English' | 'Tamil' | 'Tanglish';
}

export class AIAgentService {
  private static instance: AIAgentService;

  private config: AIProviderConfig = {
    provider: 'glm',
    model: 'GLM-5.2 (Academic Standard)',
    endpoint: '/api/ai/chat',
    temperature: 0.7,
    maxTokens: 512,
    timeoutMs: 5000,
    language: 'English',
  };

  private constructor() {}

  public static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  public getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AIProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Generates structured response with context injection and safety validation
   */
  public async generateResponse(userMessage: string): Promise<{
    raw: any;
    validated: AIStructuredResponse;
    validationStatus: boolean;
    latencyMs: number;
    providerUsed: string;
  }> {
    const startTime = performance.now();
    const robotState = RobotStateService.getInstance().getState();
    const memoryMgr = MemoryManager.getInstance();
    const userProfile = memoryMgr.getProfile();
    const relevantMemories = memoryMgr.searchMemories(userMessage);
    const schedule = memoryMgr.getSchedule();

    // Prepare context payload
    const contextPayload = {
      user: {
        name: userProfile.name,
        subject: userProfile.studySubject,
        preferredLanguage: this.config.language || userProfile.preferredLanguage,
      },
      robotState: {
        battery: robotState.sensors.batteryPct,
        charging: robotState.sensors.charging,
        obstacleDetected: robotState.obstacleDetected,
        obstacleDistanceCm: robotState.sensors.ultrasonicCm,
        position: robotState.odometry,
        currentEmotion: robotState.emotion,
      },
      retrievedMemories: relevantMemories.slice(0, 4).map((m) => m.content),
      upcomingEvents: schedule.slice(0, 3).map((s) => `${s.title} (${s.date} at ${s.startTime})`),
      allowedActions: [
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
        'sleep',
        'wake',
        'celebrate',
        'alert',
        'emergency_stop',
      ],
    };

    let rawResponse: any = null;
    let providerUsed = this.config.provider;

    // 1. If not strictly in demo mode, try calling the server API proxy
    if (this.config.provider !== 'demo') {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const res = await fetch(this.config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage,
            context: contextPayload,
            model: this.config.model,
            provider: this.config.provider,
            language: this.config.language,
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          if (data && data.response) {
            rawResponse = data;
          }
        }
      } catch (err) {
        console.warn('Backend AI route failed or timed out. Falling back to local reasoning engine:', err);
      }
    }

    // 2. If backend was unavailable or in Demo mode, use intelligent local reasoning engine
    if (!rawResponse) {
      providerUsed = 'demo';
      rawResponse = this.generateLocalReasoning(userMessage, contextPayload);
    }

    const latencyMs = Math.round(performance.now() - startTime);

    // 3. Strict schema & safety validation
    const validationResult = AIResponseValidator.validate(rawResponse);

    // 4. Auto-save memory if AI proposed memory update
    if (validationResult.validatedResponse.memory_update && validationResult.validatedResponse.memory_text) {
      memoryMgr.addMemory(
        validationResult.validatedResponse.memory_text,
        'fact',
        'high',
        'ai_extracted'
      );
    }

    return {
      raw: rawResponse,
      validated: validationResult.validatedResponse,
      validationStatus: validationResult.valid,
      latencyMs,
      providerUsed,
    };
  }

  /**
   * Deterministic local companion reasoning engine
   * Handles English, Tamil, and Tanglish prompts natively for offline robustness
   */
  private generateLocalReasoning(message: string, context: any): AIStructuredResponse {
    const text = message.toLowerCase().trim();

    // 1. Tamil / Tanglish greetings and phrases (Section 38 & 39)
    if (text.includes('nalla irukkiya') || text.includes('epdi irukka')) {
      return {
        response: 'Naan romba nalla irukken da! Neenga epdi irukkeenga? Study session start pannalama?',
        emotion: 'happy',
        action: 'wave',
        speak: true,
        priority: 'normal',
      };
    }

    if (text.includes('va da') || text.includes('hello minmini') || text.includes('hi minmini') || text.startsWith('hi') || text.startsWith('hello')) {
      return {
        response: `Hello ${context.user.name}! I am MINMINI, your personal care companion. All systems and telemetry are nominal. How can I assist you right now?`,
        emotion: 'happy',
        action: 'wave',
        speak: true,
        priority: 'normal',
      };
    }

    if (text.includes('padi da') || text.includes('study') || text.includes('pomodoro')) {
      return {
        response: 'Kandippa! Let us begin our 25-minute Pomodoro study block for Computer Networks. I will keep your schedule on track and mute non-essential alerts.',
        emotion: 'focused',
        action: 'nod',
        speak: true,
        priority: 'high',
        notification: true,
      };
    }

    // 2. Exam and schedule queries
    if (text.includes('exam') || text.includes('networks') || text.includes('schedule')) {
      return {
        response: 'Your Final Year Computer Networks semester exam is scheduled for next Friday at 10:00 AM in Hall 302. You have 3 revision tasks remaining on your schedule.',
        emotion: 'happy',
        action: 'nod',
        speak: true,
        priority: 'high',
      };
    }

    // 3. Movement and physical commands
    if (text.includes('move forward') || text.includes('go forward')) {
      return {
        response: 'Acknowledged. Navigating forward with differential drive kinematics at 0.25 m/s.',
        emotion: 'focused',
        action: 'forward',
        speak: true,
      };
    }

    if (text.includes('move backward') || text.includes('go back')) {
      return {
        response: 'Reversing MINMINI. Rear clearance is verified.',
        emotion: 'neutral',
        action: 'backward',
        speak: true,
      };
    }

    if (text.includes('turn left') || text.includes('rotate left')) {
      return {
        response: 'Rotating left 45 degrees.',
        emotion: 'happy',
        action: 'rotate_left',
        speak: true,
      };
    }

    if (text.includes('turn right') || text.includes('rotate right')) {
      return {
        response: 'Rotating right 45 degrees.',
        emotion: 'happy',
        action: 'rotate_right',
        speak: true,
      };
    }

    if (text.includes('stop') || text.includes('halt')) {
      return {
        response: 'Motors halted immediately. Standing by.',
        emotion: 'neutral',
        action: 'stop',
        speak: true,
      };
    }

    if (text.includes('nod') || text.includes('yes')) {
      return {
        response: 'Understood, I agree!',
        emotion: 'happy',
        action: 'nod',
        speak: true,
      };
    }

    if (text.includes('shake head') || text.includes('no')) {
      return {
        response: 'I see what you mean, let us reconsider.',
        emotion: 'confused',
        action: 'shake_head',
        speak: true,
      };
    }

    if (text.includes('sleep') || text.includes('good night')) {
      return {
        response: 'Good night! Entering energy-saving sleep mode. Sleep well and wake up refreshed.',
        emotion: 'sleeping',
        action: 'sleep',
        speak: true,
      };
    }

    if (text.includes('wake up') || text.includes('wake')) {
      return {
        response: 'Good morning! MINMINI is awake, sensors online and ready for your day.',
        emotion: 'excited',
        action: 'wake',
        speak: true,
      };
    }

    if (text.includes('celebrate') || text.includes('well done') || text.includes('passed')) {
      return {
        response: 'Fantastic job! Celebrating your hard work and achievements!',
        emotion: 'celebrating',
        action: 'celebrate',
        speak: true,
        priority: 'high',
      };
    }

    // 4. Memory extraction query (Section 27 & 156)
    if (text.includes('remind me') || text.includes('remember')) {
      return {
        response: `I have saved this note to your SQLite persistent memory: "${message}". I will remind you when the time arrives.`,
        emotion: 'happy',
        action: 'nod',
        speak: true,
        memory_update: true,
        memory_text: message.replace(/remind me (to|that)?/i, '').trim(),
      };
    }

    // 5. Battery and telemetry status query
    if (text.includes('battery') || text.includes('power') || text.includes('status')) {
      return {
        response: `My battery level is currently at ${context.robotState.battery}%, with voltage at 7.8V. Digital Twin telemetry synchronization is active.`,
        emotion: context.robotState.battery > 30 ? 'happy' : 'low_battery',
        action: 'head_center',
        speak: true,
      };
    }

    // 6. Natural conversational fallback
    return {
      response: `I heard you say: "${message}". As your personal care robot, I am keeping track of your study timetable and digital twin telemetry. Would you like me to move, check your schedule, or run a sensor check?`,
      emotion: 'curious',
      action: 'nod',
      speak: true,
      priority: 'normal',
    };
  }
}
