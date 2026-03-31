/**
 * FirmeAPI Error Classes
 */

/**
 * Base error class for all FirmeAPI errors
 */
export class FirmeApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'FirmeApiError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, FirmeApiError.prototype);
  }
}

/**
 * Thrown when authentication fails (invalid or missing API key)
 */
export class AuthenticationError extends FirmeApiError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Thrown when a resource is not found
 */
export class NotFoundError extends FirmeApiError {
  constructor(message: string, code: string = 'NOT_FOUND') {
    super(message, code, 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends FirmeApiError {
  public readonly retryAfter: number;
  public readonly currentUsage: number;
  public readonly limit: number;

  constructor(
    message: string,
    code: string = 'RATE_LIMIT_EXCEEDED',
    retryAfter: number = 1,
    currentUsage: number = 0,
    limit: number = 0
  ) {
    super(message, code, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.currentUsage = currentUsage;
    this.limit = limit;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Thrown when credits are exhausted
 */
export class InsufficientCreditsError extends FirmeApiError {
  public readonly availableCredits: number;
  public readonly requiredCredits: number;

  constructor(
    message: string,
    code: string = 'CREDITS_EXHAUSTED',
    availableCredits: number = 0,
    requiredCredits: number = 1
  ) {
    super(message, code, 403);
    this.name = 'InsufficientCreditsError';
    this.availableCredits = availableCredits;
    this.requiredCredits = requiredCredits;
    Object.setPrototypeOf(this, InsufficientCreditsError.prototype);
  }
}

/**
 * Thrown when request validation fails
 */
export class ValidationError extends FirmeApiError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code, 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Thrown when the API returns an unexpected error
 */
export class ApiError extends FirmeApiError {
  constructor(message: string, code: string = 'API_ERROR', statusCode: number = 500) {
    super(message, code, statusCode);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Thrown when a network error occurs
 */
export class NetworkError extends FirmeApiError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Thrown when request times out
 */
export class TimeoutError extends FirmeApiError {
  constructor(message: string = 'Request timed out') {
    super(message, 'TIMEOUT', 0);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
