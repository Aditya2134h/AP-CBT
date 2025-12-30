import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true,
    public details?: any
  ) {
    super(message);
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(public errors: Array<{ field: string; message: string }>) {
    super('Validation failed', 400, true, errors);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Authorization failed') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(entity = 'Resource') {
    super(`${entity} not found`, 404);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      details: error.details,
    }, { status: error.statusCode });
  }

  if (error instanceof Error) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
    }, { status: 500 });
  }

  return NextResponse.json({
    status: 'error',
    message: 'Internal server error',
  }, { status: 500 });
}

export function logError(error: unknown, context: string = 'Unknown'): void {
  console.error(`[${new Date().toISOString()}] [${context}] Error:`, error);
  
  if (error instanceof Error) {
    console.error('Stack trace:', error.stack);
  }
}