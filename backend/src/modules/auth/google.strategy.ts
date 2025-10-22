import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID || 'noop';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'noop';
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback';
    if (clientID === 'noop' || clientSecret === 'noop') {
      // eslint-disable-next-line no-console
      console.warn('[Auth][Google] GOOGLE_CLIENT_ID/SECRET not set — strategy will be inert.');
    }
    super({ clientID, clientSecret, callbackURL, scope: ['email', 'profile'] });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) {
    const { id, emails } = profile;
    const email = emails?.[0]?.value;
    done(null, { provider: 'google', providerAccountId: id, email });
  }
}
