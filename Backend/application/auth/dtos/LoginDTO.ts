/** Login — input + output in one module (same pattern as admin ListSubscriptionsDTO). */

export interface ILoginInputDTO {
  email: string;
  password: string;
}

export interface ILoginOutputDTO {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}
