export interface ICreateSubscribtionInput {
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

export interface IAdminCreateSubscribtion {
  execute(input: ICreateSubscribtionInput): Promise<void>;
}