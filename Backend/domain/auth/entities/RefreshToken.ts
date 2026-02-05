export interface RefreshTokenProps {
    id?: string;
    userId: string;
    tokenHash: string;
    deviceInfo: string;
    expiresAt: Date;
    revoked?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class RefreshToken {
    readonly id?: string;
    readonly userId: string;
    readonly tokenHash: string;
    readonly deviceInfo: string;
    readonly expiresAt: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private _revoked: boolean;

    private constructor(props: RefreshTokenProps) {
        this.id = props.id;
        this.userId = props.userId;
        this.tokenHash = props.tokenHash;
        this.deviceInfo = props.deviceInfo;
        this.expiresAt = props.expiresAt;
        this._revoked = props.revoked ?? false;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }

    static create(props: Omit<RefreshTokenProps, 'id' | 'createdAt' | 'updatedAt' | 'revoked'>): RefreshToken {
        return new RefreshToken({
            ...props,
            revoked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static reconstitute(props: RefreshTokenProps): RefreshToken {
        return new RefreshToken(props);
    }

    get revoked(): boolean {
        return this._revoked;
    }

    revoke(): void {
        this._revoked = true;
    }

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isValid(): boolean {
        return !this._revoked && !this.isExpired();
    }
}
