export interface OAuthSessionPayload {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface IOAuthSession {
  save(sessionId: string, payload: OAuthSessionPayload): Promise<void>;
  get(sessionId: string): Promise<string | null>;
  delete(sessionId: string): Promise<void>;
}
