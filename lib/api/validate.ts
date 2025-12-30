import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export function validateRequest(schema: ZodSchema, data: unknown) {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
    }));
    
    return {
      success: false,
      errors,
      data: null,
    } as const;
  }
  
  return {
    success: true,
    errors: null,
    data: result.data,
  } as const;
}

export function handleValidationError(errors: Array<{ field: string; message: string }>) {
  return NextResponse.json({
    status: 'error',
    message: 'Validation failed',
    errors,
  }, { status: 400 });
}

export function handleServerError(error: unknown) {
  console.error('Server error:', error);
  
  return NextResponse.json({
    status: 'error',
    message: error instanceof Error ? error.message : 'Internal server error',
  }, { status: 500 });
}

export function handleSuccessResponse(data: unknown, message = 'Success') {
  return NextResponse.json({
    status: 'success',
    message,
    data,
  });
}