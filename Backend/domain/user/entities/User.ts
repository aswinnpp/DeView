import { Email } from "../value-objects/Email";
import { Role } from "../value-objects/Role";
import { DomainError } from "../../../shared/errors/DomainError";

export type AuthProvider = "email" | "google";

export class User {
  constructor(
    public id: string | null,
    public fullName: string,
    public email: Email,
    public passwordHash: string,
    public role: Role,
    public companyId?: string,
    public isActive: boolean = true,
    public isEmailVerified: boolean = false,
    public authProvider: AuthProvider = "email"
  ) {}

  // ✅ Factory (good)
  static create(params: {
    fullName: string;
    email: Email;
    passwordHash: string;
    role: Role;
    authProvider?: AuthProvider;
    companyId?: string;
  }) {
    return new User(
      null,
      params.fullName,
      params.email,
      params.passwordHash,
      params.role,
      params.companyId,
      true,
      params.authProvider === "google",
      params.authProvider ?? "email"
    );
  }

  verifyEmail() {
    this.isEmailVerified = true;
  }

  deactivate() {
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
  }

  updateName(name: string) {
    if (!name.trim()) {
      throw new DomainError("Name required");
    }

    this.fullName = name;
  }

  markEmailAsVerified() {
    this.isEmailVerified = true;
  }
}
