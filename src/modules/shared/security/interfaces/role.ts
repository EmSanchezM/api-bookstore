export type UserRole = 'admin' | 'editor' | 'user';

export const ROLES = {
  ADMIN: 'admin' as const,
  EDITOR: 'editor' as const,
  USER: 'user' as const,
};
