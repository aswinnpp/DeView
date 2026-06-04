
export class OTPCode {
  private _value: string;

  constructor(otp: string) {


    this._value = otp;
  }

  getValue(): string {
    return this._value;
  }

  equals(other: OTPCode): boolean {
    return this._value === other._value;
  }

  static generate(): OTPCode {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    return new OTPCode(otp);
  }
}
