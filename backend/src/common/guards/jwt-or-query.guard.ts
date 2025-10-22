import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtOrQueryGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    const bearer = auth && auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
    const token = bearer || (req.query?.token as string | undefined);
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET || 'change-me' });
      req.user = { userId: payload.sub, email: payload.email };
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
