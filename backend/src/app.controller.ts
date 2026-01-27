import { Controller, Get } from '@nestjs/common';


@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      message: '🚀 LinkedIn OAuth Backend API',
      version: '1.0.0',
      endpoints: {
        auth: {
          login: 'GET /auth/linkedin',
          callback: 'GET /auth/linkedin/callback',
          status: 'GET /auth/status',
        },
        user: {
          profile: 'GET /user/profile',
        },
        posts: {
          create: 'POST /posts/create',
          linkedinProfile: 'GET /posts/linkedin-profile',
        },
      },
      documentation: 'Visit the endpoints above to interact with the API',
    };
  }
}
