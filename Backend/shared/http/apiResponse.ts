

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; message: string };

export function success<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}
