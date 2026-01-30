import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { IsNotEmpty, IsString } from 'class-validator';

class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createPost(@Req() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(req.user.id, createPostDto.content);
  }

  @Get('linkedin-profile')
  @UseGuards(AuthGuard('jwt'))
  async getLinkedInProfile(@Req() req) {
    return this.postsService.getLinkedInProfile(req.user.id);
  }
}
