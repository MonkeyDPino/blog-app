import { Module } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';
import { Post } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
