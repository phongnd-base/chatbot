import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { GroupService } from './group.service';

@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupController {
  constructor(private groups: GroupService) {}

  @Get()
  list(@Req() req: any) {
    return this.groups.list(req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateGroupDto) {
    return this.groups.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groups.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.groups.remove(req.user.userId, id);
  }

  @Get(':id/sessions')
  listSessions(@Req() req: any, @Param('id') id: string) {
    return this.groups.listSessions(req.user.userId, id);
  }
}
