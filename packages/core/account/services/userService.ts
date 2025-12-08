/**
 * Core Account - User Service
 * Service untuk mengelola user
 */

import { User } from '../models/User';

export interface UserService {
  getUsers(companyId: string): Promise<User[]>;
  getUser(userId: string): Promise<User>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(userId: string, user: Partial<User>): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}

class UserServiceImpl implements UserService {
  async getUsers(companyId: string): Promise<User[]> {
    // TODO: Implement API call to get users
    throw new Error('Not implemented');
  }

  async getUser(userId: string): Promise<User> {
    // TODO: Implement API call to get user
    throw new Error('Not implemented');
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // TODO: Implement API call to create user
    throw new Error('Not implemented');
  }

  async updateUser(userId: string, user: Partial<User>): Promise<User> {
    // TODO: Implement API call to update user
    throw new Error('Not implemented');
  }

  async deleteUser(userId: string): Promise<void> {
    // TODO: Implement API call to delete user
    throw new Error('Not implemented');
  }
}

export const userService: UserService = new UserServiceImpl();

