/**
 * API Utilities - Reusable error handling, validation, and response helpers
 * 
 * Usage:
 * import { ApiError, parseRequestJson, validateRequired, handleError } from '@/lib/api-utils';
 * 
 * try {
 *   validateContentType(request);
 *   const data = await parseRequestJson(request);
 *   validateRequired(data, ['tripId', 'amount']);
 *   // ... handler logic
 * } catch (error) {
 *   return handleError(error);
 * }
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Custom API Error class for standardized error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Safely parse JSON from NextRequest
 * Throws ApiError with helpful message if JSON is malformed
 */
export async function parseRequestJson(request: NextRequest): Promise<any> {
  try {
    const text = await request.text();
    
    if (!text || text.trim().length === 0) {
      throw new ApiError('Request body is empty', 400, 'EMPTY_BODY');
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown JSON error';
      throw new ApiError(
        `Invalid JSON in request body: ${errorMsg}`,
        400,
        'JSON_PARSE_ERROR',
        { rawError: errorMsg }
      );
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to read request body', 400, 'READ_BODY_ERROR');
  }
}

/**
 * Validate required fields exist and are non-empty
 * Throws ApiError if any required fields are missing
 */
export function validateRequired(
  data: any,
  fields: string[]
): void {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });

  if (missing.length > 0) {
    throw new ApiError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'MISSING_FIELDS',
      { missingFields: missing }
    );
  }
}

/**
 * Validate Content-Type header is application/json
 */
export function validateContentType(request: NextRequest): void {
  const contentType = request.headers.get('content-type');
  
  if (!contentType) {
    throw new ApiError(
      'Content-Type header is required',
      400,
      'MISSING_CONTENT_TYPE'
    );
  }

  if (!contentType.includes('application/json')) {
    throw new ApiError(
      `Content-Type must be application/json, got: ${contentType}`,
      400,
      'INVALID_CONTENT_TYPE'
    );
  }
}

/**
 * Sanitize and validate a string input
 * Trims whitespace and enforces max length
 */
export function sanitizeString(
  value: unknown,
  maxLength: number = 1000,
  fieldName: string = 'string'
): string {
  if (typeof value !== 'string') {
    throw new ApiError(
      `${fieldName} must be a string`,
      400,
      'INVALID_TYPE',
      { fieldName, expectedType: 'string', receivedType: typeof value }
    );
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new ApiError(
      `${fieldName} cannot be empty`,
      400,
      'EMPTY_STRING',
      { fieldName }
    );
  }

  if (trimmed.length > maxLength) {
    throw new ApiError(
      `${fieldName} exceeds maximum length of ${maxLength} characters`,
      400,
      'STRING_TOO_LONG',
      { fieldName, maxLength, actualLength: trimmed.length }
    );
  }

  return trimmed;
}

/**
 * Validate and parse a number
 */
export function parseNumber(
  value: unknown,
  fieldName: string = 'number',
  options: { min?: number; max?: number } = {}
): number {
  const num = Number(value);

  if (isNaN(num)) {
    throw new ApiError(
      `${fieldName} must be a valid number`,
      400,
      'INVALID_NUMBER',
      { fieldName }
    );
  }

  if (options.min !== undefined && num < options.min) {
    throw new ApiError(
      `${fieldName} must be at least ${options.min}`,
      400,
      'NUMBER_TOO_SMALL',
      { fieldName, min: options.min, value: num }
    );
  }

  if (options.max !== undefined && num > options.max) {
    throw new ApiError(
      `${fieldName} must be at most ${options.max}`,
      400,
      'NUMBER_TOO_LARGE',
      { fieldName, max: options.max, value: num }
    );
  }

  return num;
}

/**
 * Validate UUID format
 */
export function validateUUID(value: unknown, fieldName: string = 'id'): string {
  const str = String(value);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(str)) {
    throw new ApiError(
      `${fieldName} must be a valid UUID`,
      400,
      'INVALID_UUID',
      { fieldName }
    );
  }

  return str;
}

/**
 * Validate email format
 */
export function validateEmail(value: unknown, fieldName: string = 'email'): string {
  const str = String(value);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(str)) {
    throw new ApiError(
      `${fieldName} must be a valid email address`,
      400,
      'INVALID_EMAIL',
      { fieldName }
    );
  }

  return str;
}

/**
 * Validate URL format
 */
export function validateUrl(value: unknown, fieldName: string = 'url'): string {
  const str = String(value);

  try {
    new URL(str);
    return str;
  } catch {
    throw new ApiError(
      `${fieldName} must be a valid URL`,
      400,
      'INVALID_URL',
      { fieldName }
    );
  }
}

/**
 * Check request has Authorization header
 */
export function requireAuth(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    throw new ApiError(
      'Authorization header required',
      401,
      'MISSING_AUTH'
    );
  }

  // Extract token from "Bearer {token}"
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(
      'Invalid authorization header format. Use: Bearer {token}',
      401,
      'INVALID_AUTH_FORMAT'
    );
  }

  return token;
}

/**
 * Standardized error response handler
 * Converts ApiError or generic Error into consistent JSON response
 */
export function handleError(error: unknown): NextResponse {
  // Handle ApiError
  if (error instanceof ApiError) {
    console.error(
      `[${error.code}] ${error.message}`,
      error.details ? JSON.stringify(error.details) : ''
    );

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Handle generic Error
  if (error instanceof Error) {
    console.error('Unexpected error:', error.message, error.stack);

    // Don't leak internal error messages to client
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  // Handle unknown error
  console.error('Unknown error type:', error);

  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Wrapper for POST handlers with automatic error handling
 * Usage:
 *   export const POST = wrapHandler(async (req, data) => {
 *     validateRequired(data, ['tripId']);
 *     // ... logic
 *     return { success: true };
 *   });
 */
export function wrapHandler(
  handler: (request: NextRequest, data: any) => Promise<any>
) {
  return async (request: NextRequest) => {
    try {
      validateContentType(request);
      const data = await parseRequestJson(request);
      const result = await handler(request, data);
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Rate limit helper - adds headers to response
 * Usage: addRateLimitHeaders(response, 100, 95, 1609459200)
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set('RateLimit-Limit', String(limit));
  response.headers.set('RateLimit-Remaining', String(remaining));
  response.headers.set('RateLimit-Reset', String(resetTime));
  return response;
}

/**
 * Log API request for monitoring
 */
export function logApiRequest(
  method: string,
  path: string,
  userId?: string,
  metadata?: any
): void {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${method} ${path}${userId ? ` (user: ${userId})` : ''}`,
    metadata ? JSON.stringify(metadata) : ''
  );
}

/**
 * Log API response for monitoring
 */
export function logApiResponse(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  userId?: string
): void {
  const timestamp = new Date().toISOString();
  const statusEmoji = statusCode >= 400 ? '❌' : '✅';
  console.log(
    `[${timestamp}] ${statusEmoji} ${method} ${path} ${statusCode} (${durationMs}ms)${
      userId ? ` [user: ${userId}]` : ''
    }`
  );
}
