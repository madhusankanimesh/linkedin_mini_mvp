import { Controller, Get, Post, Put, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from './user.entity';
import { IsOptional, IsString } from 'class-validator';

class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  goals?: string;

  @IsOptional()
  @IsString()
  challenges?: string;

  @IsOptional()
  @IsString()
  targetCountry?: string;

  @IsOptional()
  @IsString()
  contentTone?: string;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req): Promise<Omit<User, 'accessToken'>> {
    return this.userService.getProfile(req.user.id);
  }

  @Get('linkedin-profile')
  @UseGuards(AuthGuard('jwt'))
  async getLinkedInProfile(@Req() req) {
    return this.userService.fetchLinkedInProfile(req.user.id);
  }

  @Get('preferences')
  @UseGuards(AuthGuard('jwt'))
  async getPreferences(@Req() req) {
    return this.userService.getPreferences(req.user.id);
  }

  @Put('preferences')
  @UseGuards(AuthGuard('jwt'))
  async updatePreferences(@Req() req, @Body() preferencesDto: UpdatePreferencesDto) {
    return this.userService.updatePreferences(req.user.id, preferencesDto);
  }

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@Req() req) {
    return this.userService.getDashboardData(req.user.id);
  }
}
