// src/utils/date.util.ts
export const normalizeDateOnly = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  return String(value); // assume already normalized
};
