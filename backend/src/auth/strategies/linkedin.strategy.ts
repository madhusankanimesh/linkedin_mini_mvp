import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import axios from 'axios';

interface LinkedInProfile {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

@Injectable()
export class LinkedInStrategy extends PassportStrategy(OAuth2Strategy, 'linkedin') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization?prompt=login',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID'),
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET'),
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL'),
      scope: ['openid', 'profile', 'email', 'w_member_social'],
      state: false, // Disable state to avoid session requirement
    });
  }

  async validate(accessToken: string, refreshToken: string): Promise<any> {
    try {
      // Fetch user profile from LinkedIn using the new API
      const profileResponse = await axios.get<LinkedInProfile>('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const profile = profileResponse.data;

      // Transform LinkedIn profile to our format
      const userProfile = {
        id: profile.sub,
        emails: profile.email ? [{ value: profile.email }] : [],
        name: {
          givenName: profile.given_name || '',
          familyName: profile.family_name || '',
        },
        photos: profile.picture ? [{ value: profile.picture }] : [],
        _json: profile,
      };

      const user = await this.authService.validateLinkedInUser(userProfile, accessToken);
      return user;
    } catch (error: any) {
      console.error('LinkedIn profile fetch error:', error.response?.data || error.message);
      throw error;
    }
  }
}
