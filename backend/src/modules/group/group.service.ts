import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateGroupDto, UpdateGroupDto } from './dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.group.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({ data: { name: dto.name, userId } });
  }

  async update(userId: string, id: string, dto: UpdateGroupDto) {
    const found = await this.prisma.group.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    return this.prisma.group.update({ where: { id }, data: { ...dto } });
  }

  async remove(userId: string, id: string) {
    const found = await this.prisma.group.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    // Move sessions to Ungrouped (set groupId to null) before deleting the group
    await this.prisma.session.updateMany({ where: { groupId: id, userId }, data: { groupId: null } });
    await this.prisma.group.delete({ where: { id } });
    return { ok: true };
  }

  listSessions(userId: string, groupId: string) {
    return this.prisma.session.findMany({ where: { groupId, userId }, orderBy: { updatedAt: 'desc' } });
  }
}
