import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
