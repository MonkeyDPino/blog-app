import { UsersService } from '../services/users.service';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUsers(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.usersService.getUserById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/profile')
  async getUserProfile(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Profile> {
    return await this.usersService.getUserProfile(id);
  }

  @Get(':id/posts')
  async getUserPosts(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getUserPosts(id);
  }

  @Post()
  async createUser(@Body() userData: CreateUserDto): Promise<User> {
    return await this.usersService.create(userData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return await this.usersService.delete(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, userData);
  }
}
