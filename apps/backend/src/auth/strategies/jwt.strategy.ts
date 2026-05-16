import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Env } from '../../env.model';
import { ConfigService as CS } from '@nestjs/config';
import { Payload } from '../models/payload.model';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: CS<Env>) {
    const secret = configService.get('JWT_SECRET', { infer: true });
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: (req: Request) =>
        (req?.cookies?.['access_token'] as string | undefined) ?? null,
      ignoreExpiration: false,
      secretOrKey: secret,
      issuer: configService.get('JWT_ISSUER', { infer: true }),
      audience: configService.get('JWT_AUDIENCE', { infer: true }),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: Payload): Payload {
    return payload;
  }
}
