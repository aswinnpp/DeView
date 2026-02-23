import { Email } from "../value-objects/Email";
import { Role } from "../value-objects/Role";

export type AuthProvider = "email" | "google";

export class User {
  constructor(
    public id: string | null,
    public fullName: string,
    public email: Email,
    public passwordHash: string | undefined,
    public role: Role,
    public createdAt:Date,
    public companyId?: string,
    public isActive: boolean = true,
    public isEmailVerified: boolean = false,
    public authProvider: AuthProvider = "email"
   
  ) {}

  static create(params: {
    fullName: string;
    email: Email;
    passwordHash?: string;
    role: Role;
    authProvider?: AuthProvider;
    companyId?: string;
    createdAt: Date;
  }) {
    return new User(
      null,
      params.fullName,
      params.email,
      params.passwordHash,
      params.role,
      params.createdAt,
      params.companyId,
      true,
      params.authProvider === "google",
      params.authProvider ?? "email"
    );
  }


  deactivate() {
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
  }


  markEmailAsVerified() {
    this.isEmailVerified = true;
  }
}
