export interface IOAuthSession {
  save(sessionId: string, payload: unknown): Promise<void>;
  get(sessionId: string): Promise<string | null>;
  delete(sessionId: string): Promise<void>;
}
