import type { Guard } from '@inversifyjs/http-core';
import type express from 'express';
import { injectable } from 'inversify';

import { ForbiddenException } from '@/modules/shared/exceptions';
import { ROLES } from '@/modules/shared/security/interfaces';
import type { AuthenticatedRequest } from '@/modules/users/presentation/middlewares/auth.guard';

@injectable()
export class AdminOrEditorGuard implements Guard<express.Request> {
  async activate(req: express.Request): Promise<boolean> {
    const user = (req as AuthenticatedRequest).user;

    if (!user) throw new ForbiddenException('Acceso denegado');

    if (user.role !== ROLES.ADMIN && user.role !== ROLES.EDITOR)
      throw new ForbiddenException(
        'Se requiere rol de administrador o editor',
      );

    return true;
  }
}
