import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as https from 'https';

@Injectable()
export class PostsService {
  constructor(private readonly userService: UserService) {}

  async createPost(userId: string, content: string): Promise<any> {
    const user = await this.userService.findById(Number(userId));
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.accessToken) {
      throw new BadRequestException('No LinkedIn access token found');
    }

    // LinkedIn API v2 - Create a post
    const postData = {
      author: `urn:li:person:${user.linkedinId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };
    

    return this.makeLinkedInRequest(user.accessToken, postData);
  }

  private makeLinkedInRequest(accessToken: string, postData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(postData);

      const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/ugcPosts',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              success: true,
              data: JSON.parse(responseData || '{}'),
              message: 'Post published successfully on LinkedIn',
            });
          } else {
            reject(new BadRequestException(`LinkedIn API error: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new BadRequestException(`Failed to post to LinkedIn: ${error.message}`));
      });

      req.write(data);
      req.end();
    });
  }

  async getLinkedInProfile(userId: string): Promise<any> {
    const user = await this.userService.findById(Number(userId));
    if (!user || !user.accessToken) {
      throw new BadRequestException('User not found or not authenticated');
    }

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(responseData));
          } else {
            reject(new BadRequestException(`LinkedIn API error: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new BadRequestException(`Failed to fetch profile: ${error.message}`));
      });

      req.end();
    });
  }
}
