import { DomainError } from "../../../shared/errors/DomainError";

export const ALLOWED_ROLES = [
  "admin",
  "company",
  "hr",
  "interviewer",
  "candidate",
] as const;

export type RoleType = typeof ALLOWED_ROLES[number];

export class Role {
  private readonly _value: RoleType;

  constructor(role: string) {
    if (!ALLOWED_ROLES.includes(role as RoleType)) {
      throw new DomainError(`Invalid role: ${role}`);
    }

    this._value = role as RoleType;
  }

  getValue(): RoleType {
    return this._value;
  }

  isAdmin() {
    return this._value === "admin";
  }

  isCompany() {
    return this._value === "company";
  }

  isHR() {
    return this._value === "hr";
  }

  isInterviewer() {
    return this._value === "interviewer";
  }

  isCandidate() {
    return this._value === "candidate";
  }

  equals(other: Role): boolean {
    return this._value === other._value;
  }
}
