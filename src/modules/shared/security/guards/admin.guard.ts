import type { Guard } from '@inversifyjs/http-core';
import type express from 'express';
import { injectable } from 'inversify';

import { ForbiddenException } from '@/modules/shared/exceptions';
import { ROLES } from '@/modules/shared/security/interfaces';
import type { AuthenticatedRequest } from '@/modules/users/presentation/middlewares/auth.guard';

@injectable()
export class AdminGuard implements Guard<express.Request> {
  async activate(req: express.Request): Promise<boolean> {
    const user = (req as AuthenticatedRequest).user;

    if (!user) throw new ForbiddenException('Acceso denegado');

    if (user.role !== ROLES.ADMIN)
      throw new ForbiddenException('Se requiere rol de administrador');

    return true;
  }
}
