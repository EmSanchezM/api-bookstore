import type { UserRole } from './role';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface TokenProvider {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
