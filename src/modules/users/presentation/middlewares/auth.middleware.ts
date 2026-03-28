import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseMiddleware } from 'inversify-express-utils';
import { TYPES } from '@/core/common/constants/types';
import { UnauthorizedException } from '@/modules/shared/exceptions';
import type {
  TokenPayload,
  TokenProvider,
} from '@/modules/shared/security/interfaces';

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  constructor(
    @inject(TYPES.TokenProvider) private tokenProvider: TokenProvider,
  ) {
    super();
  }

  async handler(req: Request, _res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new UnauthorizedException('Token no proporcionado');

      const token = authHeader.split(' ')[1];
      const payload = await this.tokenProvider.verify(token);

      (req as AuthenticatedRequest).user = payload;

      next();
    } catch (error) {
      next(error);
    }
  }
}
