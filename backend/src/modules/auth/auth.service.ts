import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({ data: { email: dto.email, password: hash } });
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.password) throw new UnauthorizedException('Use OAuth to login');
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, createdAt: true } });
    return user;
  }

  refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, { secret: process.env.JWT_SECRET || 'change-me' });
      return this.issueTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private issueTokens(userId: string, email: string) {
    const accessToken = this.jwt.sign({ sub: userId, email }, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign({ sub: userId, email }, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async oauthLogin(oauth: { provider: string; providerAccountId: string; email?: string }) {
    const email = oauth.email || `${oauth.providerAccountId}@${oauth.provider}.oauth`;
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) user = await this.prisma.user.create({ data: { email, password: '' } });
    await this.prisma.account.upsert({
      where: { provider_providerAccountId: { provider: oauth.provider, providerAccountId: oauth.providerAccountId } },
      update: { userId: user.id },
      create: { userId: user.id, provider: oauth.provider, providerAccountId: oauth.providerAccountId },
    });
    return this.issueTokens(user.id, user.email);
  }
}
