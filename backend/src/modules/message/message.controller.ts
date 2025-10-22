import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateMessageDto } from './dto';
import { MessageService } from './message.service';
import type { Response } from 'express';
import { PrismaService } from '../../prisma.service';
import { AiService } from '../ai/ai.service';

@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);
  constructor(private messages: MessageService, private prisma: PrismaService, private ai: AiService) {}

  @Get(':sessionId')
  list(@Req() req: any, @Param('sessionId') sessionId: string) {
    return this.messages.list(req.user.userId, sessionId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateMessageDto) {
    return this.messages.create(req.user.userId, dto);
  }

  // HTTP streaming endpoint (NDJSON): returns {"delta":"..."}\n chunks and a final {"done":true,"messageId":"..."}\n
  @Post('stream')
  async stream(
    @Req() req: any,
    @Body('sessionId') sessionId: string,
    @Body('prompt') prompt: string,
    @Res() res: Response,
  ) {
    // Validate
    if (!sessionId || !prompt) {
      res.status(400).json({ error: 'sessionId and prompt are required' });
      return;
    }
    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId: req.user.userId } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
  // Persist user message
    await this.prisma.message.create({ data: { sessionId, role: 'user', content: prompt } });
    // Assistant placeholder
    let assistant = await this.prisma.message.create({ data: { sessionId, role: 'assistant', content: '' } });

    // Headers for chunked NDJSON
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    // Some proxies buffer responses; this header can help with Nginx
    res.setHeader('X-Accel-Buffering', 'no');

  const model = (session as any)?.model || 'gpt-3.5-turbo';
  const provider = (session as any)?.provider || 'OPENAI';
    this.logger.log(`stream start sid=${sessionId} provider=${provider} model=${model}`);
    let full = '';
    try {
      for await (const delta of this.ai.streamReply(prompt, model, provider)) {
        full += delta;
        res.write(JSON.stringify({ delta }) + '\n');
      }
    } catch (e) {
      // Optionally emit an error line
      res.write(JSON.stringify({ error: 'stream_error' }) + '\n');
      this.logger.error(`stream error sid=${sessionId}: ${(e as any)?.message || e}`);
    }
    try {
      assistant = await this.prisma.message.update({ where: { id: assistant.id }, data: { content: full } });
      res.write(JSON.stringify({ done: true, messageId: assistant.id }) + '\n');
      this.logger.log(`stream done sid=${sessionId} mid=${assistant.id} chars=${full.length}`);
    } catch {}
    res.end();
  }
}
