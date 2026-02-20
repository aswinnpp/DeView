import { GoogleUserDTO } from "../../dtos/GoogleUserDTO";

export interface GoogleAuthPort {
  getAuthUrl(role?: string, mode?: string): string;
  verifyToken(code: string): Promise<GoogleUserDTO>;
}
