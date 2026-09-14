/**
 * MINMINI Safety Layer & AI Response Validator
 * Ensures commands conform to physical robot limits and whitelists.
 */
import {
  ALLOWED_ACTIONS,
  AIStructuredResponse,
  EmotionType,
  RobotActionType,
} from '../types/minmini';

export const VALID_EMOTIONS: readonly EmotionType[] = [
  'neutral',
  'happy',
  'sad',
  'angry',
  'surprised',
  'confused',
  'thinking',
  'listening',
  'speaking',
  'sleeping',
  'excited',
  'worried',
  'curious',
  'love',
  'tired',
  'bored',
  'focused',
  'celebrating',
  'error',
  'offline',
  'low_battery',
  'emergency',
];

export interface ValidationResult {
  valid: boolean;
  validatedResponse: AIStructuredResponse;
  rejectedFields: string[];
  reasons: string[];
}

export class AIResponseValidator {
  public static validate(raw: any): ValidationResult {
    const rejectedFields: string[] = [];
    const reasons: string[] = [];

    // Fallback defaults
    let responseText = 'Hello! I am MINMINI, your personal care companion.';
    let emotion: EmotionType = 'neutral';
    let action: RobotActionType = 'idle';
    let speak = true;
    let priority: 'normal' | 'high' | 'critical' = 'normal';
    let memory_update = false;
    let memory_text: string | undefined = undefined;
    let notification = false;

    if (!raw || typeof raw !== 'object') {
      return {
        valid: false,
        validatedResponse: {
          response: typeof raw === 'string' ? raw : responseText,
          emotion: 'neutral',
          action: 'idle',
          speak: true,
          priority: 'normal',
        },
        rejectedFields: ['root_payload'],
        reasons: ['Malformed or non-object payload returned by AI agent.'],
      };
    }

    // Validate response text
    if (typeof raw.response === 'string' && raw.response.trim().length > 0) {
      responseText = raw.response.trim();
    } else {
      rejectedFields.push('response');
      reasons.push('Empty or missing response field, using default greeting.');
    }

    // Validate emotion
    if (raw.emotion && typeof raw.emotion === 'string') {
      const em = raw.emotion.toLowerCase().trim() as EmotionType;
      if (VALID_EMOTIONS.includes(em)) {
        emotion = em;
      } else {
        rejectedFields.push('emotion');
        reasons.push(`Unknown emotion "${raw.emotion}", falling back to "neutral".`);
        emotion = 'neutral';
      }
    }

    // Validate action against strict whitelist
    if (raw.action && typeof raw.action === 'string') {
      const act = raw.action.toLowerCase().trim() as RobotActionType;
      if (ALLOWED_ACTIONS.includes(act)) {
        action = act;
      } else {
        rejectedFields.push('action');
        reasons.push(`Action "${raw.action}" is not in whitelist, rejected for safety. Fallback to "idle".`);
        action = 'idle';
      }
    }

    if (typeof raw.speak === 'boolean') {
      speak = raw.speak;
    }

    if (raw.priority === 'high' || raw.priority === 'critical' || raw.priority === 'normal') {
      priority = raw.priority;
    }

    if (typeof raw.memory_update === 'boolean') {
      memory_update = raw.memory_update;
      if (memory_update && typeof raw.memory_text === 'string' && raw.memory_text.trim()) {
        memory_text = raw.memory_text.trim();
      }
    }

    if (typeof raw.notification === 'boolean') {
      notification = raw.notification;
    }

    const valid = rejectedFields.length === 0;

    return {
      valid,
      validatedResponse: {
        response: responseText,
        emotion,
        action,
        speak,
        priority,
        memory_update,
        memory_text,
        notification,
      },
      rejectedFields,
      reasons,
    };
  }
}
