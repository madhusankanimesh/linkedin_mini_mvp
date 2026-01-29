import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Post } from './posts.entity';
import * as https from 'https';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly userService: UserService,
  ) {}

  async createPost(userId: string, content: string, isAIGenerated = false): Promise<any> {
    const user = await this.userService.findById(Number(userId));
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.accessToken) {
      throw new BadRequestException('No LinkedIn access token found');
    }

    // LinkedIn API v2 - UGC Post (Updated format)
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
    
    try {
      // Post to LinkedIn
      const linkedinResponse = await this.makeLinkedInRequest(user.accessToken, postData);

      // Save post to database
      const post = this.postRepository.create({
        content,
        userId: user.id,
        linkedinPostId: linkedinResponse.data?.id || null,
        status: 'PUBLISHED',
        isAIGenerated,
        publishedAt: new Date(),
      });

      const savedPost = await this.postRepository.save(post);

      return {
        ...linkedinResponse,
        post: savedPost,
      };
    } catch (error) {
      // Save post as FAILED if LinkedIn API fails
      const post = this.postRepository.create({
        content,
        userId: user.id,
        linkedinPostId: null,
        status: 'FAILED',
        isAIGenerated,
        publishedAt: null,
      });

      await this.postRepository.save(post);
      throw error;
    }
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async generateAIContent(userId: number): Promise<{ content: string }> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const preferences = await this.userService.getPreferences(userId);

    // AI Content Generation Logic
    const content = this.createPersonalizedContent(user, preferences);

    return { content };
  }

  private createPersonalizedContent(user: any, preferences: any): string {
    const templates = this.getTemplatesByTone(preferences.contentTone || 'professional');
    const template = templates[Math.floor(Math.random() * templates.length)];

    const name = user.firstName;
    const role = preferences.role || user.headline || 'Professional';
    const goals = preferences.goals || 'achieving excellence';
    const challenges = preferences.challenges || 'staying ahead in a competitive market';
    const country = preferences.targetCountry || 'global market';

    let content = template
      .replace('{name}', name)
      .replace('{role}', role)
      .replace('{goals}', goals)
      .replace('{challenges}', challenges)
      .replace('{country}', country);

    return content;
  }

  private getTemplatesByTone(tone: string): string[] {
    const templates = {
      professional: [
        `As a {role}, I've learned that {goals} requires dedication and continuous learning. One of the biggest {challenges} is understanding market dynamics. What strategies have worked for you? 🚀 #Professional #CareerGrowth`,
        `Reflecting on my journey as a {role}, I'm grateful for the lessons learned. {goals} isn't just a goal—it's a commitment. How do you tackle {challenges}? 💼 #Leadership #Success`,
        `In today's {country} landscape, {role}s face unique opportunities. My focus on {goals} has taught me valuable lessons about {challenges}. What's your experience? 🌟 #Business #Innovation`
      ],
      casual: [
        `Hey everyone! 👋 As a {role}, I've been thinking about {goals}. Anyone else dealing with {challenges}? Would love to hear your thoughts! 💭 #Community #Learning`,
        `Just wanted to share... Being a {role} has its ups and downs. Working towards {goals} while handling {challenges} keeps life interesting! What's everyone else up to? 😊 #Journey #Growth`,
        `Quick thought: {goals} as a {role} in {country} is quite the adventure! {challenges} makes it even more interesting. Anyone else on a similar path? 🌈 #Thoughts #Career`
      ],
      inspirational: [
        `🌟 Every day as a {role}, I'm reminded that {goals} starts with believing in yourself. Yes, {challenges} is real, but so is your potential! Keep pushing forward! 💪 #Inspiration #Motivation #Success`,
        `Dream big! As a {role} in {country}, I've learned that {goals} is within reach when you persist through {challenges}. Your journey matters! ✨ #Believe #Achievement #Growth`,
        `💫 The path of a {role} isn't always easy, but {goals} is worth every challenge. Remember: {challenges} is temporary, but your impact is lasting! #Inspire #Leadership #Impact`
      ],
      educational: [
        `📚 Key Insights for {role}s: When working towards {goals}, understanding {challenges} is crucial. Here's what I've learned in {country}... (thread 🧵) #Education #Knowledge #Learning`,
        `Let's talk about {goals} from a {role} perspective. One major factor is {challenges}. Here are 3 strategies that work: 1) Stay informed 2) Network actively 3) Adapt quickly. Thoughts? 🎓 #Tips #Professional`,
        `📊 Analysis: As a {role}, {goals} requires strategic thinking. The challenge of {challenges} in {country} can be overcome with the right approach. What methods have you found effective? #Strategy #Business`
      ]
    };

    return templates[tone] || templates.professional;
  }

  private makeLinkedInRequest(accessToken: string, postData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(postData);

      console.log('🔍 LinkedIn API Request:', {
        url: 'https://api.linkedin.com/v2/ugcPosts',
        method: 'POST',
        data: postData,
        dataString: data
      });

      const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/ugcPosts',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'X-Restli-Protocol-Version': '2.0.0',
        },
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          console.log('📥 LinkedIn API Response:', {
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseData
          });

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              success: true,
              data: JSON.parse(responseData || '{}'),
              message: 'Post published successfully on LinkedIn',
            });
          } else {
            const errorMessage = `LinkedIn API error (${res.statusCode}): ${responseData}`;
            console.error('❌ LinkedIn API Error:', errorMessage);
            reject(new BadRequestException(errorMessage));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request Error:', error);
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
