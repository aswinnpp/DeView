

export type ApiSuccess<T> = { success: true; data: T };

export function success<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}
