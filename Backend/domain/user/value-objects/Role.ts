export type RoleType = 'admin' | 'company' | 'hr' | 'interviewer' | 'candidate';

export class Role {
    private readonly value: RoleType;

    constructor(role: string) {
        this.value = role as RoleType;
    }

    getValue(): RoleType {
        return this.value;
    }

    isAdmin(): boolean {
        return this.value === 'admin';
    }

    isCompany(): boolean {
        return this.value === 'company';
    }

    isHR(): boolean {
        return this.value === 'hr';
    }

    isInterviewer(): boolean {
        return this.value === 'interviewer';
    }

    isCandidate(): boolean {
        return this.value === 'candidate';
    }

    equals(other: Role): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
