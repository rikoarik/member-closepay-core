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
  /**
   * Get all outlets for a company
   * @param companyId - Company ID
   * @returns Array of outlets (empty array as fallback until implemented)
   */
  async getOutlets(companyId: string): Promise<Outlet[]> {
    // Validate input
    throwIfInvalid(validateId(companyId, 'companyId'));

    // TODO: Implement API call to get outlets
    // Return empty array as fallback until implemented
    return [];
  }

  /**
   * Get outlet by ID
   * @param outletId - Outlet ID
   * @returns Outlet data
   * @throws Error if outlet not found (when implemented)
   */
  async getOutlet(outletId: string): Promise<Outlet> {
    // Validate input
    throwIfInvalid(validateId(outletId, 'outletId'));

    // TODO: Implement API call to get outlet
    throw new Error('Get outlet not implemented yet');
  }

  /**
   * Create new outlet
   * @param outlet - Outlet data to create
   * @returns Created outlet with ID
   * @throws Error if creation fails (when implemented)
   */
  async createOutlet(outlet: Omit<Outlet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outlet> {
    // Validate required fields
    if (outlet.companyId) {
      throwIfInvalid(validateId(outlet.companyId, 'companyId'));
    }
    if (outlet.name) {
      throwIfInvalid(validateString(outlet.name, 'name', 1, 255));
    }

    // TODO: Implement API call to create outlet
    throw new Error('Create outlet not implemented yet');
  }

  /**
   * Update outlet
   * @param outletId - Outlet ID to update
   * @param outlet - Partial outlet data to update
   * @returns Updated outlet
   * @throws Error if update fails (when implemented)
   */
  async updateOutlet(outletId: string, outlet: Partial<Outlet>): Promise<Outlet> {
    // Validate input
    throwIfInvalid(validateId(outletId, 'outletId'));

    if (outlet.name !== undefined) {
      throwIfInvalid(validateString(outlet.name, 'name', 1, 255, true));
    }

    // TODO: Implement API call to update outlet
    throw new Error('Update outlet not implemented yet');
  }

  /**
   * Delete outlet
   * @param outletId - Outlet ID to delete
   * @throws Error if deletion fails (when implemented)
   */
  async deleteOutlet(outletId: string): Promise<void> {
    // Validate input
    throwIfInvalid(validateId(outletId, 'outletId'));

    // TODO: Implement API call to delete outlet
    throw new Error('Delete outlet not implemented yet');
  }
}

export const outletService: OutletService = new OutletServiceImpl();

