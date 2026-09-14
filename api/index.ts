import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

// Lazy Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// In-memory telemetry buffer (resets per cold start on serverless)
let latestHardwareTelemetry: any = {
  robotId: 'MINMINI-PHYSICAL-001',
  timestamp: new Date().toISOString(),
  batteryPct: 88,
  batteryVoltage: 7.82,
  ultrasonicCm: 45,
  headingDeg: 0,
  temperatureC: 44.5,
  status: 'online',
};

const commandQueue: any[] = [];

// 1. Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MINMINI Robotic Backend & Digital Twin Server (Vercel)',
    timestamp: new Date().toISOString(),
  });
});

// 2. Telemetry Exchange
app.get('/api/telemetry', (_req, res) => {
  res.json({ success: true, telemetry: latestHardwareTelemetry });
});

app.post('/api/telemetry', (req, res) => {
  latestHardwareTelemetry = {
    ...latestHardwareTelemetry,
    ...req.body,
    timestamp: new Date().toISOString(),
  };
  res.json({
    success: true,
    queuedCommands: commandQueue.splice(0, commandQueue.length),
  });
});

// 3. Actuator Action Dispatch
app.post('/api/actions', (req, res) => {
  const { action, parameters } = req.body;
  if (!action) {
    res.status(400).json({ error: 'Action parameter required' });
    return;
  }
  commandQueue.push({
    id: 'cmd_' + Date.now(),
    action,
    parameters: parameters || {},
    timestamp: new Date().toISOString(),
  });
  res.json({
    success: true,
    message: `Action '${action}' queued for physical execution`,
  });
});

// 4. Server-Side AI Chat (Gemini)
app.post('/api/ai/chat', async (req, res) => {
  const { message, context, language = 'tanglish' } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const client = getGeminiClient();
    if (client) {
      const systemInstruction = `You are MINMINI, an intelligent desktop personal care robot and academic study companion designed for a final-year engineering student named Arun Kumar.
Language mode: ${language}. If Tanglish or Tamil is used, reply naturally in warm Tanglish (mix of Tamil and English) or English as appropriate.
You must reply with ONLY a single valid JSON object adhering to this schema:
{
  "response": "Brief friendly spoken statement",
  "emotion": "neutral" | "happy" | "thinking" | "focused" | "listening" | "caution" | "celebrating",
  "action": "idle" | "wave" | "nod" | "shake_head" | "forward" | "backward" | "left" | "right" | "stop" | "head_center" | "head_left" | "head_right" | "look_up" | "look_down" | "sleep" | "wake" | "celebrate",
  "speak": true,
  "priority": "normal" | "high" | "critical"
}`;

      const prompt = `${context ? `[Context: ${JSON.stringify(context)}]\n` : ''}User said: "${message}"`;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        res.json({ success: true, ...parsed });
      } catch {
        res.json({
          success: true,
          response: text.trim(),
          emotion: 'happy',
          action: 'nod',
          speak: true,
          priority: 'normal',
        });
      }
    } else {
      res.json({
        success: true,
        response: `MINMINI received: "${message}". Telemetry and companion functions active.`,
        emotion: 'happy',
        action: 'nod',
        speak: true,
        priority: 'normal',
        simulated: true,
      });
    }
  } catch (err: any) {
    console.error('Gemini route error:', err);
    res.json({
      success: true,
      response: 'MINMINI encountered an upstream communication timeout. Safe fallback active.',
      emotion: 'caution',
      action: 'idle',
      speak: true,
      priority: 'normal',
    });
  }
});

export default app;
