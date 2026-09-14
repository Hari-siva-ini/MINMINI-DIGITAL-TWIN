/**
 * MINMINI Server Entry Point (Express + Vite)
 * Handles API routes for server-side Gemini/GLM integration,
 * physical robot telemetry ingestion, action dispatching, and Vite SPA serving.
 */
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// In CJS bundle, __dirname and __filename are provided by Node runtime
declare const __filename: string;
declare const __dirname: string;
const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// In-memory buffer for physical robot telemetry
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

// Queued physical commands
const commandQueue: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MINMINI Robotic Backend & Digital Twin Server',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Telemetry Exchange Endpoint (Physical Robot Bridge)
  app.get('/api/telemetry', (req, res) => {
    res.json({
      success: true,
      telemetry: latestHardwareTelemetry,
    });
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

  // 3. Actuator Action Dispatch Endpoint
  app.post('/api/actions', (req, res) => {
    const { action, parameters } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Action parameter required' });
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

  // 4. Server-Side AI Chat / GLM / Gemini Route
  app.post('/api/ai/chat', async (req, res) => {
    const { message, context, language = 'tanglish' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
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
          return res.json({ success: true, ...parsed });
        } catch {
          // If JSON parse fails, wrap in default format
          return res.json({
            success: true,
            response: text.trim(),
            emotion: 'happy',
            action: 'nod',
            speak: true,
            priority: 'normal',
          });
        }
      } else {
        // Fallback when no server-side API key is set
        return res.json({
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
      console.error('Gemini server route error:', err);
      return res.json({
        success: true,
        response: 'MINMINI encountered an upstream communication timeout. Safe fallback active.',
        emotion: 'caution',
        action: 'idle',
        speak: true,
        priority: 'normal',
      });
    }
  });

  // 5. Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MINMINI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
