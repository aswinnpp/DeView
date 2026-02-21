  import { DomainError } from "../../../shared/errors/DomainError";

export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!email || typeof email !== "string") {
      throw new DomainError("Email is required");
    }

    const normalized = email.toLowerCase().trim();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalized)) {
      throw new DomainError("Invalid email format");
    }

    this.value = normalized;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
