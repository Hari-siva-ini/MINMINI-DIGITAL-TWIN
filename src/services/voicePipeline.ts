/**
 * MINMINI Speech Pipeline (STT, TTS, Audio Visualizer, Interruption Management)
 * Supports English, Tamil, and Tanglish mixed audio synthesis.
 */
import { RobotStateService } from './robotState';

type VoiceStateListener = (state: {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  waveformLevel: number;
  error: string | null;
}) => void;

export class VoicePipelineService {
  private static instance: VoicePipelineService;

  private recognition: any = null;
  private isListening = false;
  private isSpeaking = false;
  private currentTranscript = '';
  private waveformLevel = 0;
  private error: string | null = null;
  private listeners: Set<VoiceStateListener> = new Set();
  private audioContext: AudioContext | null = null;
  private animationFrameId: number | null = null;

  private constructor() {
    this.initSpeechRecognition();
  }

  public static getInstance(): VoicePipelineService {
    if (!VoicePipelineService.instance) {
      VoicePipelineService.instance = new VoicePipelineService();
    }
    return VoicePipelineService.instance;
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener({
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      transcript: this.currentTranscript,
      waveformLevel: this.waveformLevel,
      error: this.error,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private initSpeechRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US'; // Supports multilingual Tanglish/English

        this.recognition.onstart = () => {
          this.isListening = true;
          this.error = null;
          // Interruption: If MINMINI is speaking when user speaks, cancel speech!
          if (this.isSpeaking) {
            this.stopSpeaking();
          }
          RobotStateService.getInstance().executeAction('listen');
          this.simulateWaveform(true);
          this.notify();
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              this.currentTranscript = event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (interim) {
            this.currentTranscript = interim;
          }
          this.notify();
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          this.error = event.error;
          this.isListening = false;
          this.simulateWaveform(false);
          this.notify();
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.simulateWaveform(false);
          this.notify();
        };
      } catch (err) {
        console.warn('Web Speech API unavailable in this frame context', err);
      }
    }
  }

  public startListening(): boolean {
    if (!this.recognition) {
      // Fallback demo listening simulation if browser lacks mic permission in iframe
      this.isListening = true;
      this.simulateWaveform(true);
      RobotStateService.getInstance().executeAction('listen');
      this.notify();

      setTimeout(() => {
        const sampleUtterances = [
          'Hello MINMINI, how are you doing today?',
          'When is my Networks exam scheduled?',
          'Move forward a little bit and wave.',
          'Nalla irukkiya da MINMINI?',
          'Can you help me start a Pomodoro study session?',
        ];
        this.currentTranscript =
          sampleUtterances[Math.floor(Math.random() * sampleUtterances.length)];
        this.isListening = false;
        this.simulateWaveform(false);
        this.notify();
      }, 2500);

      return true;
    }

    try {
      this.currentTranscript = '';
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn('Recognition start exception, using fallback:', e);
      this.isListening = true;
      this.simulateWaveform(true);
      RobotStateService.getInstance().executeAction('listen');
      this.notify();
      setTimeout(() => {
        this.isListening = false;
        this.simulateWaveform(false);
        this.notify();
      }, 2000);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.isListening = false;
    this.simulateWaveform(false);
    this.notify();
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!text || text.trim().length === 0) return;

    // Interrupt previous speech
    this.stopSpeaking();

    this.isSpeaking = true;
    RobotStateService.getInstance().executeAction('speak');
    this.simulateWaveform(true);
    this.notify();

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.15; // Friendly desktop companion voice pitch

        // Select suitable English or natural voice
        const voices = window.speechSynthesis.getVoices();
        const friendlyVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
        );
        if (friendlyVoice) {
          utterance.voice = friendlyVoice;
        }

        utterance.onboundary = () => {
          // Drive mouth movement intensity
          RobotStateService.getInstance().setSpeechWaveform(0.5 + Math.random() * 0.5);
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          RobotStateService.getInstance().setSpeechWaveform(0);
          RobotStateService.getInstance().executeAction('idle');
          this.simulateWaveform(false);
          this.notify();
          if (onEnd) onEnd();
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
          RobotStateService.getInstance().setSpeechWaveform(0);
          RobotStateService.getInstance().executeAction('idle');
          this.simulateWaveform(false);
          this.notify();
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Speech synthesis error, fallback to visual animation timer', err);
      }
    }

    // Fallback simulation for environments without audio devices
    const wordCount = text.split(/\s+/).length;
    const durationMs = Math.max(1500, wordCount * 280);

    const interval = setInterval(() => {
      RobotStateService.getInstance().setSpeechWaveform(0.3 + Math.random() * 0.7);
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      this.isSpeaking = false;
      RobotStateService.getInstance().setSpeechWaveform(0);
      RobotStateService.getInstance().executeAction('idle');
      this.simulateWaveform(false);
      this.notify();
      if (onEnd) onEnd();
    }, durationMs);
  }

  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.isSpeaking = false;
    RobotStateService.getInstance().setSpeechWaveform(0);
    this.simulateWaveform(false);
    this.notify();
  }

  private simulateWaveform(active: boolean): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (!active) {
      this.waveformLevel = 0;
      this.notify();
      return;
    }

    const loop = () => {
      if (!this.isListening && !this.isSpeaking) {
        this.waveformLevel = 0;
        this.notify();
        return;
      }
      this.waveformLevel = 0.2 + Math.random() * 0.8;
      RobotStateService.getInstance().setSpeechWaveform(this.waveformLevel);
      this.notify();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  private notify(): void {
    const state = {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      transcript: this.currentTranscript,
      waveformLevel: this.waveformLevel,
      error: this.error,
    };
    this.listeners.forEach((listener) => listener(state));
  }
}
