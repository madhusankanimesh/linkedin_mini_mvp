import { Injectable, NotFoundException } from '@nestjs/common';

// In-memory user storage (replace with database in production)
export interface User {
  id: string;
  linkedinId: string;
  
  email: string | null;
  firstName: string;
  lastName: string;
  headline: string;
  profilePicture: string | null;
  accessToken: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserService {
  private users: User[] = [];
  private idCounter = 1;

  async findByLinkedInId(linkedinId: string): Promise<User | null> {
    return this.users.find(user => user.linkedinId === linkedinId) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser: User = {
      id: `user_${this.idCounter++}`,
      linkedinId: userData.linkedinId,
      email: userData.email || null,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      headline: userData.headline || '',
      profilePicture: userData.profilePicture || null,
      accessToken: userData.accessToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateAccessToken(id: string, accessToken: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.accessToken = accessToken;
    user.updatedAt = new Date();
    return user;
  }

  async getProfile(id: string): Promise<Omit<User, 'accessToken'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { accessToken, ...profile } = user;
    return profile;
  }
}
