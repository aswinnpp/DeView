export interface CryptoRandomPort {

  generateRandomString(length: number, charset?: string): string;


  generateUUID(): string;
}
