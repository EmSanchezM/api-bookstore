import { SignJWT, jwtVerify } from 'jose';
import { injectable } from 'inversify';
import { getEnvironmentVariables } from '@/core/config/environment_variables';
import { UnauthorizedException } from '@/modules/shared/exceptions';
import {
  type TokenPayload,
  type TokenProvider,
  ROLES,
} from '@/modules/shared/security/interfaces';

@injectable()
export class JoseTokenProvider implements TokenProvider {
  private getSecret(): Uint8Array {
    const env = getEnvironmentVariables();
    return new TextEncoder().encode(env.JWT_SECRET);
  }

  private getExpiresIn(): string {
    const env = getEnvironmentVariables();
    return env.JWT_EXPIRES_IN;
  }

  async sign(payload: TokenPayload): Promise<string> {
    return new SignJWT({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.getExpiresIn())
      .sign(this.getSecret());
  }

  async verify(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.getSecret());
      return {
        id: payload.id as string,
        email: payload.email as string,
        role: (payload.role as TokenPayload['role']) ?? ROLES.USER,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
