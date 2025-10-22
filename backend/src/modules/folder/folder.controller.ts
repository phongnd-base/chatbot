import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateFolderDto, UpdateFolderDto } from './dto';
import { FolderService } from './folder.service';

@UseGuards(AuthGuard('jwt'))
@Controller('folders')
export class FolderController {
  constructor(private folders: FolderService) {}

  @Get()
  list(@Req() req: any) {
    return this.folders.list(req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateFolderDto) {
    return this.folders.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateFolderDto) {
    return this.folders.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.folders.remove(req.user.userId, id);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Req() req: any, @Param('id') id: string, @Body('isFavorite') isFavorite: boolean) {
    return this.folders.update(req.user.userId, id, { isFavorite });
  }

  @Get(':id/sessions')
  listSessions(@Req() req: any, @Param('id') id: string) {
    return this.folders.listSessions(req.user.userId, id);
  }
}
