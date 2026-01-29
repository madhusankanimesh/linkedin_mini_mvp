import { Controller, Get, Req, Res, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuth() {
    // Initiates LinkedIn OAuth flow
  }

  @Get('linkedin/callback')
  async linkedinAuthCallback(@Query('error') error: string, @Query('error_description') errorDescription: string, @Req() req, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Handle OAuth errors (user cancelled or denied)
    if (error) {
      return res.redirect(`${frontendUrl}/?error=${error}&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`);
    }

    try {
      // Apply LinkedIn auth guard only if no error
      const guard = new (AuthGuard('linkedin'))();
      await guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => req,
          getResponse: () => res,
        }),
      } as any);

      // Handle LinkedIn OAuth callback
      const { access_token, user } = await this.authService.login(req.user);
      
      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
    } catch (err) {
      // Handle authentication errors
      return res.redirect(`${frontendUrl}/?error=auth_failed&message=${encodeURIComponent('Authentication failed. Please try again.')}`);
    }
  }

  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  async getAuthStatus(@Req() req) {
    return {
      authenticated: true,
      user: req.user,
    };
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Clear any server-side sessions if needed
    // For now, we rely on client-side token removal
    
    return res.json({ 
      success: true, 
      message: 'Logged out successfully',
      linkedinLogoutUrl: 'https://www.linkedin.com/m/logout'
    });
  }
}
