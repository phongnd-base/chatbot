import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma.module';
import { AiModule } from './modules/ai/ai.module';
import { FolderModule } from './modules/folder/folder.module';
import { SessionModule } from './modules/session/session.module';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AiModule, AuthModule, FolderModule, SessionModule, MessageModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
