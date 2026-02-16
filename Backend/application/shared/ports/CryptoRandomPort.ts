export interface CryptoRandomPort {
  /**
   * Generates a cryptographically secure random string.
   * The `charset` can be used to constrain which characters appear.
   */
  generateRandomString(length: number, charset?: string): string;

  /**
   * Generates a cryptographically secure unique identifier.
   */
  generateUUID(): string;
}

