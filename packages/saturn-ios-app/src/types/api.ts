/**
 * Generic wrapper for successful API responses (if your API has a standard structure).
 * Adjust based on actual API response format. If responses are direct data,
 * you might not need this wrapper for success cases.
 */
export interface ApiResponse<T> {
  data: T;
  // Add other potential wrapper fields like pagination, status, etc. if applicable
  // e.g., message?: string;
}

/**
 * Standardized structure for API errors handled by the client.
 */
export interface ApiError {
  status: number | null; // HTTP status code
  message: string; // User-friendly error message
  code?: string; // Optional backend error code (e.g., 'VALIDATION_ERROR')
  details?: Record<string, unknown>; // Optional detailed error info (e.g., validation specifics)
  originalError?: unknown; // The original error object (e.g., from Axios)
}
