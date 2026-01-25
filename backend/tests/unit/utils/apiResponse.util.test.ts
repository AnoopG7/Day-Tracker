import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
} from '../../../src/utils/apiResponse.util.js';

describe('API Response Utility', () => {
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    } as Partial<Response>;
  });

  describe('successResponse', () => {
    it('should return 200 with data', () => {
      const data = { id: 1, name: 'Test' };
      
      successResponse(mockRes as Response, data);
      
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data,
      });
    });

    it('should use custom message', () => {
      successResponse(mockRes as Response, null, 'Custom success message');
      
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Custom success message',
        data: null,
      });
    });

    it('should use custom status code', () => {
      successResponse(mockRes as Response, {}, 'Success', 201);
      
      expect(statusMock).toHaveBeenCalledWith(201);
    });
  });

  describe('errorResponse', () => {
    it('should return 500 by default', () => {
      errorResponse(mockRes as Response);
      
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error',
        error: undefined,
      });
    });

    it('should use custom message and status', () => {
      errorResponse(mockRes as Response, 'Custom error', 400, 'Error details');
      
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Custom error',
        error: 'Error details',
      });
    });
  });

  describe('createdResponse', () => {
    it('should return 201 created', () => {
      const data = { id: 'new-id' };
      
      createdResponse(mockRes as Response, data);
      
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Created successfully',
        data,
      });
    });

    it('should use custom message', () => {
      createdResponse(mockRes as Response, {}, 'User created');
      
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'User created',
        data: {},
      });
    });
  });

  describe('notFoundResponse', () => {
    it('should return 404', () => {
      notFoundResponse(mockRes as Response);
      
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found',
        error: undefined,
      });
    });

    it('should use custom message', () => {
      notFoundResponse(mockRes as Response, 'User not found');
      
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
        error: undefined,
      });
    });
  });

  describe('badRequestResponse', () => {
    it('should return 400', () => {
      badRequestResponse(mockRes as Response);
      
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should include error details', () => {
      badRequestResponse(mockRes as Response, 'Invalid input', 'Field required');
      
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input',
        error: 'Field required',
      });
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return 401', () => {
      unauthorizedResponse(mockRes as Response);
      
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
        error: undefined,
      });
    });

    it('should use custom message', () => {
      unauthorizedResponse(mockRes as Response, 'Token expired');
      
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired',
        error: undefined,
      });
    });
  });
});
