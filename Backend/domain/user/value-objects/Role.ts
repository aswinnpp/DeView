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
  private readonly value: RoleType;

  constructor(role: string) {
    if (!ALLOWED_ROLES.includes(role as RoleType)) {
      throw new DomainError(`Invalid role: ${role}`);
    }

    this.value = role as RoleType;
  }

  getValue(): RoleType {
    return this.value;
  }

  isAdmin() {
    return this.value === "admin";
  }

  isCompany() {
    return this.value === "company";
  }

  isHR() {
    return this.value === "hr";
  }

  isInterviewer() {
    return this.value === "interviewer";
  }

  isCandidate() {
    return this.value === "candidate";
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }
}
