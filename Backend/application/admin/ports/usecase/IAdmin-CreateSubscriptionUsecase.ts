export interface ICreateSubscriptionInput {
  name: string;
  price: number;
  duration: "Monthly" | "Quarterly" | "Annual";
  isActive: boolean;
  interviewLimit: number;
  interviewUnlimited: boolean;
  jobPostLimit: number;
  jobUnlimited: boolean;
  hasAI: boolean;
}

export interface IAdminCreateSubscription {
  execute(input: ICreateSubscriptionInput): Promise<void>;
}
