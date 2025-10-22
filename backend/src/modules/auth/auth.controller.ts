import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Headers('authorization') authz?: string) {
    const token = authz?.replace('Bearer ', '') || '';
    return this.auth.refresh(token);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Req() req: any) {
    return this.auth.me(req.user.userId);
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return HttpStatus.OK;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const tokens = await this.auth.oauthLogin(req.user);
    // Redirect with tokens as URL params for FE demo; replace with cookie in production
    const redirect = process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000';
    const url = new URL(redirect);
    url.searchParams.set('accessToken', tokens.accessToken);
    url.searchParams.set('refreshToken', tokens.refreshToken);
    return res.redirect(url.toString());
  }
}
