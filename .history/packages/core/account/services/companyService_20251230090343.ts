/**
 * Core Account - Company Service
 * Service untuk mengelola company
 */

import { Company } from '../models/Company';
import { validateId, throwIfInvalid } from '@core/config/utils/validation';

export interface CompanyService {
  getCompany(companyId: string): Promise<Company>;
  initializeCompany(companyId: string): Promise<Company>;
  updateCompanyConfig(companyId: string, config: Record<string, unknown>): Promise<Company>;
}

class CompanyServiceImpl implements CompanyService {
  async getCompany(companyId: string): Promise<Company> {
    // Validate input
    throwIfInvalid(validateId(companyId, 'companyId'));

    // TODO: Implement API call to get company
    throw new Error('Not implemented');
  }

  async initializeCompany(companyId: string): Promise<Company> {
    // Validate input
    throwIfInvalid(validateId(companyId, 'companyId'));

    // TODO: Implement company initialization
    throw new Error('Not implemented');
  }

  async updateCompanyConfig(companyId: string, config: Record<string, unknown>): Promise<Company> {
    // Validate input
    throwIfInvalid(validateId(companyId, 'companyId'));

    if (typeof config !== 'object' || config === null) {
      throw new Error('Config must be an object');
    }

    // TODO: Implement update company config
    throw new Error('Not implemented');
  }
}

export const companyService: CompanyService = new CompanyServiceImpl();

