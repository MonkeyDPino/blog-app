import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { type Request, type Response } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '../../users/entities/user.entity';
import { Payload } from '../models/payload.model';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful — sets auth cookies and returns user',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as User;
    const result = await this.authService.login(user);
    this.authService.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
    );
    return { user: result.user };
  }

  @ApiOperation({ summary: 'Refresh access token using cookies' })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens issued via cookies',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/User' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @Post('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenId = req.cookies?.['refresh_token_id'] as string | undefined;
    const tokenValue = req.cookies?.['refresh_token_value'] as
      | string
      | undefined;

    const result = await this.authService.refreshTokens({
      tokenId: tokenId ?? '',
      tokenValue: tokenValue ?? '',
    });
    this.authService.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
    );
    return { user: result.user };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — revoke refresh token and clear cookies' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const tokenId = req.cookies?.['refresh_token_id'] as string | undefined;
    const tokenValue = req.cookies?.['refresh_token_value'] as
      | string
      | undefined;

    if (tokenId && tokenValue) {
      await this.authService.logout({ tokenId, tokenValue });
    }
    this.authService.clearAuthCookies(res);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user with profile',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req: Request) {
    const payload = req.user as Payload;
    return this.authService.getMe(payload.sub);
  }
}
