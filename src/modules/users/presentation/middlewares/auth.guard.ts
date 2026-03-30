import type { Guard } from '@inversifyjs/http-core';
import type express from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/core/common/constants/types';
import { UnauthorizedException } from '@/modules/shared/exceptions';
import type {
  TokenPayload,
  TokenProvider,
} from '@/modules/shared/security/interfaces';

export interface AuthenticatedRequest extends express.Request {
  user: TokenPayload;
}

@injectable()
export class AuthGuard implements Guard<express.Request> {
  constructor(
    @inject(TYPES.TokenProvider) private tokenProvider: TokenProvider,
  ) {}

  async activate(req: express.Request): Promise<boolean> {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer '))
      throw new UnauthorizedException('Token no proporcionado');

    const token = authHeader.split(' ')[1];
    const payload = await this.tokenProvider.verify(token);

    (req as AuthenticatedRequest).user = payload;

    return true;
  }
}
