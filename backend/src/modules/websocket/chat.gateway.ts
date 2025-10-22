import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat', cors: { origin: true, credentials: true } })
export class ChatGateway {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  onJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    if (data?.sessionId) client.join(data.sessionId);
    return { ok: true };
  }

  @SubscribeMessage('typing')
  onTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; typing: boolean }) {
    if (data?.sessionId) client.to(data.sessionId).emit('typing', { typing: !!data.typing });
  }

  emitMessageNew(sessionId: string, message: any) {
    this.server.to(sessionId).emit('message:new', message);
  }

  emitMessageStream(sessionId: string, payload: { messageId: string; delta: string }) {
    this.server.to(sessionId).emit('message:stream', payload);
  }

  emitMessageUpdate(sessionId: string, message: any) {
    this.server.to(sessionId).emit('message:update', message);
  }

  emitMessageDone(sessionId: string, payload: { messageId: string }) {
    this.server.to(sessionId).emit('message:done', payload);
  }
}
