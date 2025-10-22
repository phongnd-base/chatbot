import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSessionDto, UpdateSessionDto } from './dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.session.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  }

  get(userId: string, id: string) {
    return this.prisma.session.findFirst({ where: { id, userId } });
  }

  create(userId: string, dto: CreateSessionDto) {
    return this.prisma.session.create({ data: { title: dto.title ?? 'New Chat', userId, folderId: dto.folderId ?? null, model: dto.model ?? 'gpt-3.5-turbo', provider: (dto.provider as any) ?? 'OPENAI' } });
  }

  async update(userId: string, id: string, dto: UpdateSessionDto) {
    const found = await this.prisma.session.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    return this.prisma.session.update({ where: { id }, data: { ...dto } });
  }

  async remove(userId: string, id: string) {
    const found = await this.prisma.session.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    await this.prisma.session.delete({ where: { id } });
    return { ok: true };
  }

  async exportData(userId: string, id: string) {
    const session = await this.prisma.session.findFirst({ where: { id, userId } });
    if (!session) throw new NotFoundException();
    const messages = await this.prisma.message.findMany({ where: { sessionId: id }, orderBy: { createdAt: 'asc' } });
    return { session, messages };
  }
}
