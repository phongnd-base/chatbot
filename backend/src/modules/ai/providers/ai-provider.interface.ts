export interface AiProvider {
  readonly name: string;
  isAvailable(): boolean;
  generate(prompt: string, model: string): Promise<string>;
  stream(prompt: string, model: string): AsyncGenerator<string>;
}