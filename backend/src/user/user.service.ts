import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserPreferences } from './user-preferences.entity';
import * as https from 'https';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
  ) {}

  async findByLinkedInId(linkedinId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { linkedinId } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { id },
      relations: ['preferences', 'posts']
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async updateAccessToken(id: number, accessToken: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.accessToken = accessToken;
    return this.userRepository.save(user);
  }

  async getProfile(id: number): Promise<any> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { accessToken, ...profile } = user;
    return profile;
  }

  async fetchLinkedInProfile(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.accessToken) {
      throw new NotFoundException('User not found or not authenticated');
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
            const profileData = JSON.parse(responseData);
            resolve(profileData);
          } else {
            reject(new Error(`LinkedIn API error: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Failed to fetch profile: ${error.message}`));
      });

      req.end();
    });
  }

  async getPreferences(userId: number): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({ where: { userId } });
    
    if (!preferences) {
      preferences = this.preferencesRepository.create({
        userId,
        contentTone: 'professional'
      });
      await this.preferencesRepository.save(preferences);
    }
    
    return preferences;
  }

  async updatePreferences(userId: number, preferencesData: Partial<UserPreferences>): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({ where: { userId } });
    
    if (!preferences) {
      preferences = this.preferencesRepository.create({ userId, ...preferencesData });
    } else {
      Object.assign(preferences, preferencesData);
    }
    
    return this.preferencesRepository.save(preferences);
  }

  async getDashboardData(userId: number): Promise<any> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const preferences = await this.getPreferences(userId);
    const { accessToken, ...profileData } = user;

    return {
      profile: profileData,
      preferences,
      postCount: user.posts?.length || 0,
      recentPosts: user.posts?.slice(0, 5) || []
    };
  }
}