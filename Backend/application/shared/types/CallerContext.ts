/**
 * Minimal context passed from the delivery layer (e.g. HTTP) into application mappers.
 * Keeps the application layer free of HTTP-specific types like IAuthenticatedUser.
 */
export interface CallerContext {
  userId: string;
  companyId?: string;
}
