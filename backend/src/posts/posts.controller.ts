import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isAIGenerated?: boolean;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createPost(@Req() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(
      req.user.id, 
      createPostDto.content, 
      createPostDto.isAIGenerated || false
    );
  }

  @Get('generate-ai-content')
  @UseGuards(AuthGuard('jwt'))
  async generateAIContent(@Req() req) {
    return this.postsService.generateAIContent(req.user.id);
  }

  @Get('my-posts')
  @UseGuards(AuthGuard('jwt'))
  async getMyPosts(@Req() req) {
    return this.postsService.getUserPosts(req.user.id);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get('linkedin-profile')
  @UseGuards(AuthGuard('jwt'))
  async getLinkedInProfile(@Req() req) {
    return this.postsService.getLinkedInProfile(req.user.id);
  }
}
