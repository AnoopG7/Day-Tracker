import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message = 'Error',
  statusCode = 500,
  error?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  return res.status(statusCode).json(response);
};

export const createdResponse = <T>(
  res: Response,
  data: T,
  message = 'Created successfully'
): Response => {
  return successResponse(res, data, message, 201);
};

export const notFoundResponse = (res: Response, message = 'Resource not found'): Response => {
  return errorResponse(res, message, 404);
};

export const badRequestResponse = (
  res: Response,
  message = 'Bad request',
  error?: string
): Response => {
  return errorResponse(res, message, 400, error);
};

export const unauthorizedResponse = (res: Response, message = 'Unauthorized'): Response => {
  return errorResponse(res, message, 401);
};
