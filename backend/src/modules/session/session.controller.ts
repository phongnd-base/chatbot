import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateSessionDto, UpdateSessionDto } from './dto';
import type { Response } from 'express';
import { SessionService } from './session.service';

@UseGuards(AuthGuard('jwt'))
@Controller('sessions')
export class SessionController {
  constructor(private sessions: SessionService) {}

  @Get()
  list(@Req() req: any) { return this.sessions.list(req.user.userId); }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) { return this.sessions.get(req.user.userId, id); }

  @Post()
  create(@Req() req: any, @Body() dto: CreateSessionDto) { return this.sessions.create(req.user.userId, dto); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateSessionDto) { return this.sessions.update(req.user.userId, id, dto); }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.sessions.remove(req.user.userId, id); }

  @Patch(':id/favorite')
  favorite(@Req() req: any, @Param('id') id: string, @Body('isFavorite') isFavorite: boolean) {
    return this.sessions.update(req.user.userId, id, { isFavorite });
  }

  @Patch(':id/group')
  setGroup(@Req() req: any, @Param('id') id: string, @Body('groupId') groupId: string | null) {
    return this.sessions.update(req.user.userId, id, { groupId });
  }

  @Get(':id/export.json')
  async exportJson(@Req() req: any, @Param('id') id: string) {
    return this.sessions.exportData(req.user.userId, id);
  }

  @Get(':id/export.md')
  async exportMarkdown(@Req() req: any, @Param('id') id: string, @Res() res: Response) {
    const data = await this.sessions.exportData(req.user.userId, id);
    const lines = [
      `# ${data.session.title} (model: ${data.session.model})`,
      '',
      ...data.messages.map(m => `**${m.role}**: ${m.content}`),
      '',
    ];
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(lines.join('\n'));
  }
}
