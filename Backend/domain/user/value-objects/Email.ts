

export class Email {
  private value: string;

  constructor(email: string) {
    if (!email.includes("@")) {
      throw new Error("Invalid email");
    }

    this.value = email.toLowerCase().trim();
  }

  getValue(): string {
    return this.value;
  }
}
