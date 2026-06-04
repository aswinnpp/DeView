export class Subscription {
  constructor(
    public id: string | null,
    public name: string,
    public price: number,
    public duration: "Monthly" | "Quarterly" | "Annual",
    public interviewLimit: number,
    public interviewUnlimited: boolean,
    public jobPostLimit: number,
    public jobUnlimited: boolean,
    public hasAI: boolean,
    public isActive: boolean = true,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
