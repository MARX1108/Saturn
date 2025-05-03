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
import { AxiosError } from 'axios';

/**
 * Standardized API error structure
 */
export interface ApiError {
  /** HTTP status code (e.g., 400, 401, 404, 500), or null if no response */
  status: number | null;
  /** Human-readable error message */
  message: string;
  /** Error type or code for programmatic handling */
  code?: string;
  /** Additional error details if available */
  details?: Record<string, unknown>;
  /** Original error object for debugging */
  originalError?: AxiosError;
}

/**
 * Pagination parameters for paginated endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Standard pagination metadata in API responses
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
