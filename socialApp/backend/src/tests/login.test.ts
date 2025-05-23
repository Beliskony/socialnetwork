import { loginUser } from '../middlewares/auth';
import { LoginZodSchema } from '../schemas/User.ZodSchema';
import UserModel from '../models/User.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { twilioClient } from '../config/twilioConfig';
import { Request, Response } from 'express';

// Mocks
jest.mock('../models/User.model');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('crypto');
jest.mock('../config/twilioConfig', () => ({
  twilioClient: {
    messages: {
      create: jest.fn(),
    },
  },
}));

describe('loginUser', () => {
  const mockRequest = (body: any): Partial<Request> => ({ body });
  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if credentials are missing', async () => {
    const req = mockRequest({ usernameOrphoneNumber: '', password: '' });
    const res = mockResponse();

    const loginMiddleware = loginUser(LoginZodSchema);
   await loginMiddleware(req as Request, res as Response, () => {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username and password are required' });
  });

  it('should return 404 if user not found', async () => {
    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    const req = mockRequest({ usernameOrphoneNumber: 'notfound', password: '123456' });
    const res = mockResponse();

    const loginMiddleware = loginUser(LoginZodSchema);
    await loginMiddleware(req as Request, res as Response, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 401 if password is incorrect', async () => {
    const fakeUser = {
      password: 'hashedPassword',
    };

    (UserModel.findOne as jest.Mock).mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = mockRequest({ usernameOrphoneNumber: 'test', password: 'wrongpass' });
    const res = mockResponse();

   const loginMiddleware = loginUser(LoginZodSchema);
    await loginMiddleware(req as Request, res as Response, () => {});

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should return 400 if phoneNumber is missing', async () => {
    const fakeUser = {
      password: 'hashedPassword',
      phoneNumber: null,
    };

    (UserModel.findOne as jest.Mock).mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const req = mockRequest({ usernameOrphoneNumber: 'test', password: '123456' });
    const res = mockResponse();

    const loginMiddleware = loginUser(LoginZodSchema);
    await loginMiddleware(req as Request, res as Response, () => {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Phone number is required for OTP' });
  });

  it('should login user and send OTP', async () => {
    const fakeUser = {
      _id: 'userId123',
      username: 'testuser',
      password: 'hashedPassword',
      otp: '',
      phoneNumber: '+1234567890',
      save: jest.fn(),
    };

    (UserModel.findOne as jest.Mock).mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (crypto.randomInt as jest.Mock).mockReturnValue(123456);
    (twilioClient.messages.create as jest.Mock).mockResolvedValue({});
    (jwt.sign as jest.Mock).mockReturnValue('mockedToken');

    const req = mockRequest({ usernameOrphoneNumber: 'testuser', password: '123456' });
    const res = mockResponse();

    const loginMiddleware = loginUser(LoginZodSchema);
    await loginMiddleware(req as Request, res as Response, () => {});

    expect(fakeUser.otp).toBe('123456');
    expect(fakeUser.save).toHaveBeenCalled();
    expect(twilioClient.messages.create).toHaveBeenCalledWith({
      body: `Your OTP code is 123456 il expire dans 5 minutes`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1234567890',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login successful',
      token: 'mockedToken',
    });
  });
});