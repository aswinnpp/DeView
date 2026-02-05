export class DeviceInfo {
    readonly value: string;

    constructor(deviceInfo: string) {
        this.value = deviceInfo.trim();
    }

    equals(other: DeviceInfo): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
