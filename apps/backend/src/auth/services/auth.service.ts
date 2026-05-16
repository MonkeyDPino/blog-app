import { randomBytes, randomUUID } from 'crypto';
import { UsersService } from './../../users/services/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payload } from '../models/payload.model';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Env } from '../../env.model';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  generateJwt(user: User): string {
    const payload: Payload = { sub: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      issuer: this.configService.get('JWT_ISSUER', { infer: true }),
      audience: this.configService.get('JWT_AUDIENCE', { infer: true }),
    });
  }

  private async generateRefreshToken(
    userId: number,
  ): Promise<{ tokenId: string; tokenValue: string; expiresAt: Date }> {
    const tokenId = randomUUID();
    const tokenValue = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(tokenValue, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const entity = this.refreshTokenRepo.create({
      tokenId,
      tokenHash,
      userId,
      expiresAt,
    });
    await this.refreshTokenRepo.save(entity);

    return { tokenId, tokenValue, expiresAt };
  }

  async login(user: User): Promise<{
    accessToken: string;
    refreshToken: { tokenId: string; tokenValue: string; expiresAt: Date };
    user: User;
  }> {
    const accessToken = this.generateJwt(user);
    const refreshToken = await this.generateRefreshToken(user.id);
    return { accessToken, refreshToken, user };
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: { tokenId: string; tokenValue: string; expiresAt: Date };
    user: User;
  }> {
    const existing = await this.refreshTokenRepo.findOne({
      where: { tokenId: dto.tokenId },
      relations: ['user'],
    });

    if (!existing || existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const isMatch = await bcrypt.compare(dto.tokenValue, existing.tokenHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokenRepo.delete({ tokenId: dto.tokenId });

    const user = await this.usersService.getUserById(existing.userId);
    const accessToken = this.generateJwt(user);
    const refreshToken = await this.generateRefreshToken(existing.userId);

    return { accessToken, refreshToken, user };
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    const existing = await this.refreshTokenRepo.findOne({
      where: { tokenId: dto.tokenId },
    });

    if (!existing) {
      return;
    }

    const isMatch = await bcrypt.compare(dto.tokenValue, existing.tokenHash);
    if (isMatch) {
      await this.refreshTokenRepo.delete({ tokenId: dto.tokenId });
    }
  }

  setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: { tokenId: string; tokenValue: string; expiresAt: Date },
  ): void {
    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: 'lax' as const };
    res.cookie('access_token', accessToken, {
      ...base,
      path: '/',
      maxAge: 21600000,
    });
    res.cookie('refresh_token_id', refreshToken.tokenId, {
      ...base,
      path: '/auth',
      maxAge: 604800000,
    });
    res.cookie('refresh_token_value', refreshToken.tokenValue, {
      ...base,
      path: '/auth',
      maxAge: 604800000,
    });
  }

  clearAuthCookies(res: Response): void {
    const isProd = process.env.NODE_ENV === 'production';
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      maxAge: 0,
    };
    res.cookie('access_token', '', { ...base, path: '/' });
    res.cookie('refresh_token_id', '', { ...base, path: '/auth' });
    res.cookie('refresh_token_value', '', { ...base, path: '/auth' });
  }

  async getMe(userId: number): Promise<User> {
    return this.usersService.getUserById(userId);
  }
}
