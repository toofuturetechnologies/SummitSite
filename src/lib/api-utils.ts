/**
 * Reusable API error handling and response utilities
 * Ensures consistent error responses across all endpoints
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  details?: string;
  required?: string[];
  code?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/**
 * Parse request JSON with error handling
 */
export async function parseRequestJson(request: Request): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    if (!request.body) {
      return {
        success: false,
        error: 'Request body is required'
      };
    }

    const data = await request.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON in request body'
    };
  }
}

/**
 * Validate required fields in request data
 */
export function validateRequired(data: any, fields: string[]): { valid: boolean; missing?: string[] } {
  const missing = fields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing
    };
  }

  return { valid: true };
}

/**
 * Return success response (200)
 */
export function successResponse<T>(data: T, statusCode = 200) {
  return NextResponse.json({ success: true, data }, { status: statusCode });
}

/**
 * Return error response (400, 401, 403, 404, 500)
 */
export function errorResponse(error: string, statusCode = 400, additional?: Record<string, unknown>) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...additional
    },
    { status: statusCode }
  );
}

/**
 * Unified API handler wrapper
 * Handles common error cases and response formatting
 */
export async function apiHandler<T>(
  request: Request,
  handler: (data: any) => Promise<T>,
  options: {
    requiredFields?: string[];
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    requireAuth?: boolean;
  } = {}
): Promise<NextResponse> {
  try {
    // Check method if specified
    if (options.method && request.method !== options.method) {
      return errorResponse(`Method ${request.method} not allowed`, 405);
    }

    // Parse request body if POST/PUT
    let data = {};
    if (request.method === 'POST' || request.method === 'PUT') {
      const parseResult = await parseRequestJson(request);
      if (!parseResult.success) {
        return errorResponse(parseResult.error!, 400);
      }
      data = parseResult.data || {};
    }

    // Validate required fields
    if (options.requiredFields && options.requiredFields.length > 0) {
      const validation = validateRequired(data, options.requiredFields);
      if (!validation.valid) {
        return errorResponse(
          'Missing required fields',
          400,
          { required: validation.missing }
        );
      }
    }

    // Call handler
    const result = await handler(data);
    return successResponse(result, 201);
  } catch (error) {
    console.error('API Error:', error);
    return errorResponse(
      'Internal server error',
      500,
      {
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

/**
 * Log API request for debugging
 */
export function logApiRequest(endpoint: string, method: string, details?: any) {
  console.log(`[API] ${method} ${endpoint}`, details);
}

/**
 * Log API response for debugging
 */
export function logApiResponse(endpoint: string, statusCode: number, responseData?: any) {
  console.log(`[API] Response: ${statusCode} from ${endpoint}`, responseData);
}
