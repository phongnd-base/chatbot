import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AiProvider } from './providers/ai-provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GoogleProvider } from './providers/google.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { EchoProvider } from './providers/echo.provider';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private providers: Record<string, AiProvider> = {};

  constructor() {
    // Register providers; each encapsulates its own env and availability
    const list: AiProvider[] = [new OpenAIProvider(), new GoogleProvider(), new AnthropicProvider(), new EchoProvider()];
    for (const p of list) this.providers[p.name] = p;
    try {
      const status = list.map((p) => `${p.name}:${p.isAvailable() ? 'on' : 'off'}`).join(', ');
      this.logger.log(`AI providers registered → ${status}`);
    } catch {}
  }

  async generateReply(prompt: string, model = 'gpt-3.5-turbo', provider = 'OPENAI'): Promise<string> {
    const impl = this.providers[provider] || this.providers['OPENAI'] || this.providers['ECHO'];
    try {
      return await impl.generate(prompt, model);
    } catch (e: any) {
      this.logger.error(`${impl.name} generate error`, e?.message || e);
      // Fallback
      return await this.providers['ECHO'].generate(prompt, model);
    }
  }

  async *streamReply(prompt: string, model = 'gpt-3.5-turbo', provider = 'OPENAI'): AsyncGenerator<string> {
    const impl = this.providers[provider];
    try {
      for await (const delta of impl.stream(prompt, model)) {
        yield delta;
      }
    } catch (e: any) {
      this.logger.error(`${impl.name} stream error`, e?.message || e);
      const txt = await this.generateReply(prompt, model, provider);
      if (txt) yield txt;
    }
  }

  onModuleInit() {
    try {
      const names = Object.keys(this.providers);
      const status = names.map((n) => `${n}:${this.providers[n].isAvailable() ? 'on' : 'off'}`).join(', ');
      this.logger.log(`AiService initialized with providers → ${status}`);
    } catch (e: any) {
      this.logger.error(`AiService onModuleInit error: ${e?.message || e}`);
    }
  }
}
