/**
 * UGC Code Generation Utility
 * 
 * Generates unique codes that allow users who booked a trip to submit UGC
 * Format: TRIP-{tripId}-{timestamp}-{randomString}
 * Example: TRIP-f47ac10b-58cc-4372-a567-0e02b2c3d479-1677123456-ABC123
 */

export function generateUGCCode(tripId: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(36); // base36 for compact format
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random chars
  
  // Format: TRIP-{shortId}-{timestamp}-{random}
  // Max 32 chars for database VARCHAR(32)
  const shortTripId = tripId.substring(0, 8);
  const code = `TRIP-${shortTripId}-${timestamp}-${randomString}`;
  
  return code.substring(0, 32); // Ensure max length
}

/**
 * Validate UGC Code format
 */
export function validateUGCCodeFormat(code: string): boolean {
  return code.length > 0 && code.length <= 32 && code.startsWith('TRIP-');
}
