import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateMessageDto } from './dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException();
    return this.prisma.message.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } });
  }

  async create(userId: string, dto: CreateMessageDto) {
  const session = await this.prisma.session.findUnique({ where: { id: dto.sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();
    const created = await this.prisma.message.create({ data: { sessionId: dto.sessionId, role: dto.role, content: dto.content } });
    // No auto AI reply here; streaming is handled via SSE endpoint
    return created;
  }
}
