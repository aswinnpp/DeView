export interface ICryptoRandom {

  generateRandomString(length: number, charset?: string): string;


  generateUUID(): string;
}
