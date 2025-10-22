import OpenAI from 'openai';
import { AiProvider } from './ai-provider.interface';

export class OpenAIProvider implements AiProvider {
  readonly name = 'OPENAI';
  private client?: OpenAI;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (key) this.client = new OpenAI({ apiKey: key });
  }

  isAvailable(): boolean {
    return !!this.client;
  }

  async generate(prompt: string, model: string): Promise<string> {
    if (!this.client) return `Echo: ${prompt}`;
    const res = await this.client.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });
    return res.choices?.[0]?.message?.content || '';
  }

  async *stream(prompt: string, model: string): AsyncGenerator<string> {
    if (!this.client) {
      const parts = ("Echo: " + prompt).split(/(\s+)/);
      for (const p of parts) if (p) yield p;
      return;
    }
    const stream = await this.client.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      stream: true,
    });
    for await (const chunk of stream) {
      const delta = (chunk as any)?.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) yield delta;
    }
  }
}