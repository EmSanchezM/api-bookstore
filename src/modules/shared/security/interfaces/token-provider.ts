export interface TokenPayload {
  id: string;
  email: string;
}

export interface TokenProvider {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
