import { IGoogleUserDTO } from "../../dtos/GoogleUserDTO";

export interface IGoogleAuth {
  getAuthUrl(role?: string, mode?: string): string;
  verifyToken(code: string): Promise<IGoogleUserDTO>;
}
