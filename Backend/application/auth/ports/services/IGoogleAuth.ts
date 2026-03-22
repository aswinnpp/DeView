import type { IGoogleOAuthUserDTO } from '../../dtos/GoogleOAuthDTO.js';

export interface IGoogleAuth {
  getAuthUrl(role?: string, mode?: string): string;
  verifyToken(code: string): Promise<IGoogleOAuthUserDTO>;
}
