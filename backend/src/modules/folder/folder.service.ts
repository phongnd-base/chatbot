import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateFolderDto, UpdateFolderDto } from './dto';

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.folder.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  create(userId: string, dto: CreateFolderDto) {
    return this.prisma.folder.create({ data: { name: dto.name, userId } });
  }

  async update(userId: string, id: string, dto: UpdateFolderDto) {
    const found = await this.prisma.folder.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    return this.prisma.folder.update({ where: { id }, data: { ...dto } });
  }

  async remove(userId: string, id: string) {
    const found = await this.prisma.folder.findFirst({ where: { id, userId } });
    if (!found) throw new NotFoundException();
    // Move sessions to Unfoldered (set folderId to null) before deleting the folder
    await this.prisma.session.updateMany({ where: { folderId: id, userId }, data: { folderId: null } });
    await this.prisma.folder.delete({ where: { id } });
    return { ok: true };
  }

  listSessions(userId: string, folderId: string) {
    return this.prisma.session.findMany({ where: { folderId, userId }, orderBy: { updatedAt: 'desc' } });
  }
}
