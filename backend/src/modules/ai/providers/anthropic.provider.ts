import { AiProvider } from './ai-provider.interface';

let Anthropic: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Anthropic = require('@anthropic-ai/sdk');
} catch {}

export class AnthropicProvider implements AiProvider {
  readonly name = 'ANTHROPIC';
  private client?: any;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (key && Anthropic) this.client = new Anthropic({ apiKey: key });
  }

  isAvailable(): boolean { return !!this.client; }

  async generate(prompt: string, model: string): Promise<string> {
    if (!this.client) return `Echo: ${prompt}`;
    const msg = await this.client.messages.create({
      model: model || 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return msg?.content?.[0]?.text || '';
  }

  async *stream(prompt: string, model: string): AsyncGenerator<string> {
    if (!this.client) {
      const parts = ("Echo: " + prompt).split(/(\s+)/);
      for (const p of parts) if (p) yield p;
      return;
    }
    const stream = await this.client.messages.create({
      model: model || 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });
    for await (const event of stream) {
      // Stream emits various event types; we care about text deltas
      if (event?.type === 'content_block_delta' && event?.delta?.type === 'text_delta') {
        const t = event.delta?.text;
        if (t) yield t;
      }
    }
  }
}