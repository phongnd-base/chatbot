import { AiProvider } from './ai-provider.interface';

let GoogleGenAI: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch {}

export class GoogleProvider implements AiProvider {
  readonly name = 'GOOGLE';
  private client?: any;

  constructor() {
    const key = process.env.GOOGLE_GENAI_API_KEY;
    if (key && GoogleGenAI) {
      this.client = new GoogleGenAI({ apiKey: key });
    }
  }

  isAvailable(): boolean { return !!this.client; }

  async generate(prompt: string, model: string): Promise<string> {
    if (!this.client) return `Echo: ${prompt}`;
    const response = await this.client.models.generateContent({
      model: model || 'gemini-2.0-flash-exp',
      contents: prompt,
    });
    return response?.text || '';
  }

  async *stream(prompt: string, model: string): AsyncGenerator<string> {
    if (!this.client) {
      const parts = ("Echo: " + prompt).split(/(\s+)/);
      for (const p of parts) if (p) yield p;
      return;
    }
    const response = await this.client.models.generateContentStream({
      model: model || 'gemini-2.0-flash-exp',
      contents: prompt,
      config: { stream: true },
    });
    for await (const chunk of response) {
      const text = chunk?.text || '';
	  console.log(text);
      if (text) yield text;
    }
  }
}