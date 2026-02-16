import { GoogleUserDTO } from "../dtos/GoogleUserDTO";

export interface GoogleAuthPort {
  verifyToken(code: string): Promise<GoogleUserDTO>;
}
