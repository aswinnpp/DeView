export class OTPCode {
    private readonly value: string;

    constructor(otp: string) {
        this.value = otp;
    }

    getValue(): string {
        return this.value;
    }

    equals(other: OTPCode): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    static generate(): OTPCode {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return new OTPCode(otp);
    }
}
