import crypto from "crypto";
import { CryptoRandomPort } from "../../application/shared/ports/CryptoRandomPort";

export class NodeCryptoRandomService implements CryptoRandomPort {
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

