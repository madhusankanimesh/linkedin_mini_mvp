import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService, User } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLinkedInUser(profile: any, accessToken: string): Promise<User> {
    // Extract user data from LinkedIn profile
    const userData = {
      linkedinId: profile.id,
      email: profile.emails?.[0]?.value || null,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      headline: profile._json?.headline || '',
      profilePicture: profile.photos?.[0]?.value || null,
      accessToken,
    };

    // Find or create user
    let user = await this.userService.findByLinkedInId(userData.linkedinId);
    
    if (!user) {
      user = await this.userService.create(userData);
    } else {
      user = await this.userService.updateAccessToken(user.id, accessToken);
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      linkedinId: user.linkedinId,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        headline: user.headline,
        profilePicture: user.profilePicture,
      },
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
