export type RoleType =
  | "admin"
  | "company"
  | "hr"
  | "interviewer"
  | "candidate";

export class Role {
  private value: RoleType;

  constructor(role: string) {
    if (!["admin","company","hr","interviewer","candidate"].includes(role)) {
      throw new Error("Invalid role");
    }

    this.value = role as RoleType;
  }

  getValue(): RoleType {
    return this.value;
  }

  isCompany() {
    return this.value === "company";
  }
}
