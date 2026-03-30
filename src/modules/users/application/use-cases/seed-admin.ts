import { inject, injectable } from 'inversify';

import { TYPES } from '@/core/common/constants/types';
import { logger } from '@/core/config/logger';
import { User } from '@/modules/users/domain/entities';
import type { UserRepository } from '@/modules/users/domain/repositories';
import { type PasswordHasher, ROLES } from '@/modules/shared/security/interfaces';
import { generateUUID } from '@/modules/shared/generate-uuid';

@injectable()
export class SeedAdminUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.PasswordHasher) private passwordHasher: PasswordHasher,
  ) {}

  async execute(): Promise<void> {
    const admins = await this.userRepository.getUsersByRole(ROLES.ADMIN);

    if (admins.length > 0) {
      logger.info('Admin user already exists, skipping seed');
      return;
    }

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const firstName = process.env.ADMIN_FIRST_NAME ?? 'Admin';
    const lastName = process.env.ADMIN_LAST_NAME ?? 'System';

    if (!email || !password) {
      logger.warn(
        'ADMIN_EMAIL and ADMIN_PASSWORD env vars are required to seed admin user',
      );
      return;
    }

    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      existingUser.assignRole(ROLES.ADMIN);
      await this.userRepository.updateUser(
        existingUser.properties().id!,
        existingUser,
      );
      logger.info(`Existing user ${email} promoted to admin`);
      return;
    }

    const passwordHash = await this.passwordHasher.hash(password);

    const admin = new User({
      id: generateUUID(),
      firstName,
      lastName,
      email,
      passwordHash,
      isActive: true,
      role: ROLES.ADMIN,
    });

    await this.userRepository.createUser(admin);
    logger.info(`Admin user seeded: ${email}`);
  }
}
