export function expect<T>(value: T | undefined | null, message: string): T {
  if (!value) {
    throw new TypeError(message);
  }

  return value;
}
