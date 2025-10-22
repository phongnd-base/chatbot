import { AiProvider } from './ai-provider.interface';

export class EchoProvider implements AiProvider {
  readonly name = 'ECHO';
  isAvailable(): boolean { return true; }
  async generate(prompt: string): Promise<string> { return `Echo: ${prompt}`; }
  async *stream(prompt: string): AsyncGenerator<string> {
    const parts = ("Echo: " + prompt).split(/(\s+)/);
    for (const p of parts) if (p) yield p;
  }
}