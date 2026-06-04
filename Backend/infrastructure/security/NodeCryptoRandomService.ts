import { injectable } from 'inversify';
import crypto from "crypto";
import { ICryptoRandom } from "../../application/shared/ports/services/ICryptoRandom";

@injectable()
export class NodeCryptoRandomService implements ICryptoRandom {
  generateRandomString(length: number, charset?: string): string {
    const chars =
      charset ||
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";

    const bytes = crypto.randomBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }

    return result;
  }

  generateUUID(): string {
    return crypto.randomUUID();
  }
}

