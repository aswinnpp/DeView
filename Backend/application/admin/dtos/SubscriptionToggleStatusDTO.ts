/** Toggle subscription active flag — input + output (replaces ToggleStatusDTO). */

export interface ISubscriptionToggleStatusInputDTO {
  id: string;
}

export interface ISubscriptionToggleStatusOutputDTO {
  isActive: boolean;
}
