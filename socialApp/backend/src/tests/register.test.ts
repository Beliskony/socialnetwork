import { UserController } from '../controllers/userController';
import { UserProvider } from '../providers/User.provider';
import { Request, Response } from 'express';
import { UserService } from '../services/User.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Mocks
jest.mock('../providers/User.provider');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('UserController - createUser', () => {
  const mockRequest = (body: any): Partial<Request> => ({ body });
  const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res;
  };

  let userController: UserController;
  let userProvider: jest.Mocked<UserProvider>;

  beforeEach(() => {
    jest.clearAllMocks();
    const mockUserService = {} as jest.Mocked<UserService>;
    userProvider = new UserProvider(mockUserService) as jest.Mocked<UserProvider>;
    userController = new UserController(userProvider);
  });

  it('should return 400 if user creation fails', async () => {
    const req = mockRequest({ username: 'testuser' });
    const res = mockResponse();

    userProvider.createUser.mockRejectedValue(new Error('User creation failed'));

    await userController.createUser(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User creation failed' });
  });

  it('should create a user and return token and user ID', async () => {
    const req = mockRequest({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
    });
    const res = mockResponse();

    userProvider.createUser.mockResolvedValue(req.body);
    (jwt.sign as jest.Mock).mockReturnValue('mockedToken');

    await userController.createUser(req as Request, res as Response);

    expect(userProvider.createUser).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      phoneNumber: '+1234567890',
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      { _id: 'userId123', username: 'testuser' },
      expect.any(String),
      { expiresIn: '1h' }
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Utilisateur enregistré avec succès',
      id: 'userId123',
      token: 'mockedToken',
    });
  });
});