import { Email } from '../value-objects/Email';
import { Role } from '../value-objects/Role';
export interface UserProps {
    id?: string;
    fullName: string;
    companyName?: string | null;
    companyId?: string; // Links HR users to their company
    email: Email;
    passwordHash: string;
    role: Role;
    isActive: boolean;
    isEmailVerified: boolean;
    authProvider: 'email' | 'google';
    googleId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export class User {
    private constructor(private props: UserProps) { }
    static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isEmailVerified' | 'authProvider'> & { authProvider?: 'email' | 'google' }): User {
        const now = new Date();
        return new User({
            ...props,
            authProvider: props.authProvider || 'email',
            isActive: true,
            isEmailVerified: props.authProvider === 'google' ? true : false,
            createdAt: now,
            updatedAt: now,
        });
    }
    static reconstitute(props: UserProps): User {
        return new User(props);
    }
    get id(): string | undefined {
        return this.props.id;
    }
    get fullName(): string {
        return this.props.fullName;
    }
    get companyName(): string | null | undefined {
        return this.props.companyName;
    }
    get email(): Email {
        return this.props.email;
    }
    get passwordHash(): string {
        return this.props.passwordHash;
    }
    get role(): Role {
        return this.props.role;
    }
    get isActive(): boolean {
        return this.props.isActive;
    }
    get isEmailVerified(): boolean {
        return this.props.isEmailVerified;
    }
    get createdAt(): Date {
        return this.props.createdAt;
    }
    get updatedAt(): Date {
        return this.props.updatedAt;
    }
    get authProvider(): 'email' | 'google' {
        return this.props.authProvider;
    }
    get googleId(): string | undefined {
        return this.props.googleId;
    }
    get companyId(): string | undefined {
        return this.props.companyId;
    }
    markEmailAsVerified(): void {
        this.props.isEmailVerified = true;
        this.props.updatedAt = new Date();
    }
    activate(): void {
        this.props.isActive = true;
        this.props.updatedAt = new Date();
    }
    deactivate(): void {
        this.props.isActive = false;
        this.props.updatedAt = new Date();
    }
    updateProfile(fullName: string, companyName?: string): void {
        this.props.fullName = fullName;
        if (companyName !== undefined) {
            this.props.companyName = companyName;
        }
        this.props.updatedAt = new Date();
    }
    toPersistence(): any {
        return {
            id: this.props.id,
            fullName: this.props.fullName,
            companyName: this.props.companyName,
            companyId: this.props.companyId,
            email: this.props.email.getValue(),
            passwordHash: this.props.passwordHash,
            role: this.props.role.getValue(),
            isActive: this.props.isActive,
            isEmailVerified: this.props.isEmailVerified,
            authProvider: this.props.authProvider,
            googleId: this.props.googleId,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}
