/** Admin create subscription — input + output (void result expressed as empty). */

export interface ICreateSubscriptionInputDTO {
  name: string;
  price: number;
  duration: 'Monthly' | 'Quarterly' | 'Annual';
  isActive: boolean;
  interviewLimit: number;
  interviewUnlimited: boolean;
  jobPostLimit: number;
  jobUnlimited: boolean;
  hasAI: boolean;
}

export type ICreateSubscriptionOutputDTO = void;
