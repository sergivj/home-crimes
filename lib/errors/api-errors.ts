export class ApiError extends Error {
    constructor(
      public statusCode: number,
      message: string,
      public details?: any
    ) {
      super(message);
      this.name = 'ApiError';
    }
  }
  
  export class NotFoundError extends ApiError {
    constructor(resource: string) {
      super(404, `${resource} not found`);
      this.name = 'NotFoundError';
    }
  }
  
  export class ValidationError extends ApiError {
    constructor(message: string, details?: any) {
      super(400, message, details);
      this.name = 'ValidationError';
    }
  }
  
  export class AuthenticationError extends ApiError {
    constructor() {
      super(401, 'Authentication required');
      this.name = 'AuthenticationError';
    }
  }
  
  export const handleApiError = (error: any): ApiError => {
    if (error instanceof ApiError) {
      return error;
    }
  
    if (error?.response?.status === 401) {
      return new AuthenticationError();
    }
  
    if (error?.response?.status === 404) {
      return new NotFoundError('Resource');
    }
  
    if (error?.response?.status === 400) {
      return new ValidationError(
        error?.response?.data?.message || 'Validation failed',
        error?.response?.data?.errors
      );
    }
  
    const message = error?.message || 'An unexpected error occurred';
    return new ApiError(error?.response?.status || 500, message);
  };
  