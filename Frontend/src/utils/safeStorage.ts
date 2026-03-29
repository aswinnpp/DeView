export function safeParse<T = unknown>(value: string | null): T | null {
  if (!value || value === "undefined") {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function safeParseForKey<T = unknown>(key: string, value: string | null): T | null {
  const parsed = safeParse<T>(value);
  if (value && value !== "undefined" && parsed === null) {
    console.warn("Invalid localStorage JSON for key:", key);
  }
  return parsed;
}

export function setStorageJson(key: string, value: unknown): void {
  if (value !== undefined && value !== null) {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.removeItem(key);
  }
}
