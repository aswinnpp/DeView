export class Email {
    private readonly value: string;

    constructor(email: string) {
        this.value = email.toLowerCase().trim();
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
