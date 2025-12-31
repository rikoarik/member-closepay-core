/**
 * Core Account - User Service
 * Service untuk mengelola user
 */

import { User } from '../models/User';
import { validateId, validateString, validateEmail, throwIfInvalid } from '@core/config/utils/validation';

export interface UserService {
  getUsers(companyId: string): Promise<User[]>;
  getUser(userId: string): Promise<User>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(userId: string, user: Partial<User>): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}

class UserServiceImpl implements UserService {
  async getUsers(companyId: string): Promise<User[]> {
    // Validate input
    throwIfInvalid(validateId(companyId, 'companyId'));

    // TODO: Implement API call to get users
    throw new Error('Not implemented');
  }

  async getUser(userId: string): Promise<User> {
    // Validate input
    throwIfInvalid(validateId(userId, 'userId'));

    // TODO: Implement API call to get user
    throw new Error('Not implemented');
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Validate required fields
    throwIfInvalid(validateString(user.username, 'username', 1, 100));
    throwIfInvalid(validateString(user.name, 'name', 1, 255));
    if (user.email) {
      throwIfInvalid(validateEmail(user.email, 'email'));
    }

    // TODO: Implement API call to create user
    throw new Error('Not implemented');
  }

  async updateUser(userId: string, user: Partial<User>): Promise<User> {
    // Validate input
    throwIfInvalid(validateId(userId, 'userId'));

    if (user.username !== undefined) {
      throwIfInvalid(validateString(user.username, 'username', 1, 100, true));
    }
    if (user.name !== undefined) {
      throwIfInvalid(validateString(user.name, 'name', 1, 255, true));
    }
    if (user.email !== undefined) {
      throwIfInvalid(validateEmail(user.email, 'email'));
    }

    // TODO: Implement API call to update user
    throw new Error('Not implemented');
  }

  async deleteUser(userId: string): Promise<void> {
    // Validate input
    throwIfInvalid(validateId(userId, 'userId'));

    // TODO: Implement API call to delete user
    throw new Error('Not implemented');
  }
}

export const userService: UserService = new UserServiceImpl();

