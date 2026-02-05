export class TokenHash {
    readonly value: string;

    constructor(hash: string) {
        this.value = hash;
    }

    equals(other: TokenHash): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
