export interface ApiResponseBody<T = any> {
  statusCode: number;
  message: string;
  data: T | null;
  success: boolean;
}

/**
 * Standard API response wrapper used by controllers.
 *
 * Note: your controllers currently call this with two different argument orders:
 * - `new ApiResponse(statusCode, data, message)`
 * - `new ApiResponse(statusCode, message, data)`
 */
class ApiResponse<T = any> implements ApiResponseBody<T> {
  statusCode: number;
  message: string;
  data: T | null;
  success: boolean;

  constructor(
    statusCode: number,
    arg2: T | string | null,
    arg3?: T | string | null
  ) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;

    if (typeof arg2 === 'string') {
      // new ApiResponse(statusCode, message, data)
      this.message = arg2;
      this.data = (arg3 ?? null) as T | null;
    } else {
      // new ApiResponse(statusCode, data, message)
      this.data = (arg2 ?? null) as T | null;
      this.message = typeof arg3 === 'string' ? arg3 : '';
    }
  }
}

export { ApiResponse };