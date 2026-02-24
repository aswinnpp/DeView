export interface IGoogleOAuthUseCase {
  handleCallback(code: string | undefined, state?: string): Promise<string>;
  exchange(sessionId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; fullName: string; email: string; role: string };
  }>;
}
