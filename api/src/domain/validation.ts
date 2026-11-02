export class HttpError extends Error {
  constructor(
    public readonly statusCode: 400 | 404 | 409 | 422,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/**
 * Validates and parses monetary amounts in whole integer cents.
 * Rejects 0, negative numbers, floats (e.g. 10.5), non-numbers, and strings.
 */
export function parsePositiveIntegerCents(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new HttpError(422, 'totalCents must be a positive whole number')
  }
  return value
}

/**
 * Validates that a string is non-empty after trimming.
 */
export function parseRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${fieldName} is required`)
  }
  return value.trim()
}

/**
 * Validates the Idempotency-Key header.
 */
export function parseIdempotencyKey(headerValue: string | undefined): string {
  if (!headerValue?.trim()) {
    throw new HttpError(400, 'Idempotency-Key header is required')
  }
  return headerValue.trim()
}
