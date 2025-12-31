/**
 * Core Account - Outlet Service
 * Service untuk mengelola outlet
 */

import { Outlet } from '../models/Outlet';
import { validateId, throwIfInvalid, validateString } from '@core/config/utils/validation';

export interface OutletService {
  getOutlets(companyId: string): Promise<Outlet[]>;
  getOutlet(outletId: string): Promise<Outlet>;
  createOutlet(outlet: Omit<Outlet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outlet>;
  updateOutlet(outletId: string, outlet: Partial<Outlet>): Promise<Outlet>;
  deleteOutlet(outletId: string): Promise<void>;
}

class OutletServiceImpl implements OutletService {
  async getOutlets(companyId: string): Promise<Outlet[]> {
    // Validate input
    throwIfInvalid(validateId(companyId, 'companyId'));

    // TODO: Implement API call to get outlets
    throw new Error('Not implemented');
  }

  async getOutlet(outletId: string): Promise<Outlet> {
    // Validate input
    throwIfInvalid(validateId(outletId, 'outletId'));

    // TODO: Implement API call to get outlet
    throw new Error('Not implemented');
  }

  async createOutlet(outlet: Omit<Outlet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outlet> {
    // Validate required fields
    if (outlet.companyId) {
      throwIfInvalid(validateId(outlet.companyId, 'companyId'));
    }
    if (outlet.name) {
      throwIfInvalid(validateString(outlet.name, 'name', 1, 255));
    }

    // TODO: Implement API call to create outlet
    throw new Error('Not implemented');
  }

  async updateOutlet(outletId: string, outlet: Partial<Outlet>): Promise<Outlet> {
    // Validate input
    throwIfInvalid(validateId(outletId, 'outletId'));

    if (outlet.name !== undefined) {
      throwIfInvalid(validateString(outlet.name, 'name', 1, 255, true));
    }

    // TODO: Implement API call to update outlet
    throw new Error('Not implemented');
  }

  async deleteOutlet(outletId: string): Promise<void> {
    // Validate input
    throwIfInvalid(validateId(outletId, 'outletId'));

    // TODO: Implement API call to delete outlet
    throw new Error('Not implemented');
  }
}

export const outletService: OutletService = new OutletServiceImpl();

