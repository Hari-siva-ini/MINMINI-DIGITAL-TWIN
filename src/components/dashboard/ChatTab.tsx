/**
 * MINMINI AI Voice & Chat Interface
 * Supports speech-to-text, TTS voice feedback, Tamil & Tanglish prompts,
 * structured JSON validation inspector, and action execution tracing.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Code2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ChatMessage, RobotState } from '../../types/minmini';
import { AIAgentService } from '../../services/aiProvider';
import { VoicePipelineService } from '../../services/voicePipeline';
import { RobotStateService } from '../../services/robotState';

interface ChatTabProps {
  robotState: RobotState;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_0',
    sender: 'minmini',
    text: 'Hello! I am MINMINI, your desktop personal care companion robot. I am connected to your digital twin and ready to assist you with studies, reminders, or motion control.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    emotion: 'happy',
    action: 'wave',
    validated: true,
  },
];

export const ChatTab: React.FC<ChatTabProps> = ({ robotState }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedRawAI, setSelectedRawAI] = useState<any | null>(null);
  const [voiceState, setVoiceState] = useState({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    waveformLevel: 0,
    error: null as string | null,
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const aiService = AIAgentService.getInstance();
  const voiceService = VoicePipelineService.getInstance();
  const robotService = RobotStateService.getInstance();

  useEffect(() => {
    const unsub = voiceService.subscribe((v) => {
      setVoiceState(v);
      if (v.transcript && !v.isListening) {
        setInputValue(v.transcript);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputValue).trim();
    if (!message || isThinking) return;

    setInputValue('');

    // 1. Add User message
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    robotService.executeAction('think');

    try {
      // 2. Query AI Agent (GLM-5.2 or Gemini or Demo fallback)
      const result = await aiService.generateResponse(message);
      const validated = result.validated;

      // 3. Add AI message
      const aiMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'minmini',
        text: validated.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: validated.emotion,
        action: validated.action,
        rawAI: result.raw,
        validated: result.validationStatus,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setSelectedRawAI(result);

      // 4. Trigger physical/simulation action on robot
      robotService.setEmotion(validated.emotion);
      if (validated.action && validated.action !== 'idle') {
        robotService.executeAction(validated.action);
      }

      // 5. Speech synthesis if speak flag is set
      if (validated.speak) {
        voiceService.speak(validated.response);
      }
    } catch (err) {
      console.error('Chat execution failed', err);
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'system',
        text: 'MINMINI encountered an internal communication timeout. Falling back to safe offline state.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      robotService.executeAction('idle');
    } finally {
      setIsThinking(false);
    }
  };

  const handleVoiceToggle = () => {
    if (voiceState.isListening) {
      voiceService.stopListening();
    } else {
      voiceService.startListening();
    }
  };

  const suggestions = [
    'Hello MINMINI, how are you?',
    'Nalla irukkiya da MINMINI?',
    'When is my Networks exam?',
    'Move forward 1 meter',
    'Help me study with Pomodoro timer',
    'Remind me to revise ROS2 nodes at 5 PM',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)] min-h-[550px]">
      {/* Main Chat Conversation Card */}
      <div className="lg:col-span-8 flex flex-col bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                MINMINI AI Companion Chat
              </h2>
              <p className="text-[11px] text-slate-400">
                Model: GLM-5.2 (Academic) • English / Tamil / Tanglish Enabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {voiceState.isSpeaking && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                Speaking
              </span>
            )}
            {voiceState.isListening && (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-800">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Listening...
              </span>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm space-y-1.5 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : msg.sender === 'system'
                    ? 'bg-red-950/60 text-red-300 border border-red-800/80 rounded-bl-none'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-700/50 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>

                  {msg.sender === 'minmini' && (
                    <div className="flex items-center gap-1.5">
                      {msg.emotion && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-sky-300 capitalize">
                          {msg.emotion}
                        </span>
                      )}
                      {msg.action && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-emerald-300">
                          {msg.action}
                        </span>
                      )}
                      {msg.rawAI && (
                        <button
                          onClick={() => setSelectedRawAI({ raw: msg.rawAI, validated: msg })}
                          className="text-slate-400 hover:text-slate-200 underline ml-1"
                          title="View Structured AI schema"
                        >
                          JSON
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>MINMINI is reasoning with GLM-5.2...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-slate-400 shrink-0">Suggestions:</span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-300 whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar & Speech Controls */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
          <button
            id="btn-voice-toggle"
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-all shadow-md ${
              voiceState.isListening
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title={voiceState.isListening ? 'Click to stop speech listening' : 'Click to speak via Microphone'}
          >
            {voiceState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            id="input-chat-message"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              voiceState.isListening
                ? 'Listening to microphone... speak now'
                : 'Type a message in English or Tamil/Tanglish ("nalla irukkiya da", "move forward")...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />

          <button
            id="btn-send-message"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isThinking}
            className="p-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Structured AI & Safety Inspection Drawer (Section 20, 21, 290) */}
      <div className="lg:col-span-4 bg-slate-900/70 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between shadow-xl text-xs space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-slate-200">AI Safety & Schema Validator</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              ACTIVE
            </span>
          </div>

          <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
            Every output from GLM-5.2 is checked by{' '}
            <code className="text-sky-300">AIResponseValidator</code> to enforce the allowed action whitelist and prevent unsafe actuator motions.
          </p>

          <div className="mt-3 space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300">
              <div className="text-slate-500 text-[10px] uppercase">Active AI Model</div>
              <div className="text-sky-400 font-semibold mt-0.5">GLM-5.2 (Academic Standard)</div>
              <div className="text-slate-500 text-[10px] mt-2">Latency: ~{robotState.networkLatencyMs}ms</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-slate-400 font-semibold text-[11px] mb-1.5 flex items-center justify-between">
                <span>Latest Validated JSON Schema:</span>
                <span className="text-emerald-400 font-mono">200 OK</span>
              </div>
              <pre className="p-2.5 rounded bg-slate-900 text-slate-300 overflow-x-auto text-[10px] font-mono leading-relaxed border border-slate-800/80 max-h-56">
                {selectedRawAI
                  ? JSON.stringify(selectedRawAI.raw || selectedRawAI, null, 2)
                  : JSON.stringify(
                      {
                        response: 'Hello! I am MINMINI.',
                        emotion: 'happy',
                        action: 'wave',
                        speak: true,
                        priority: 'normal',
                      },
                      null,
                      2
                    )}
              </pre>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-900/40 text-[11px] text-slate-300 space-y-1">
          <div className="font-semibold text-sky-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Academic Pipeline Guaranteed</span>
          </div>
          <p className="text-slate-400">
            Audio / Text → Context Manager → SQLite Memory → GLM-5.2 → Validator → Safety Layer → Digital Twin.
          </p>
        </div>
      </div>
    </div>
  );
};
