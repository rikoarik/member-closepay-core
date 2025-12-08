/**
 * Core Account - Outlet Model
 * Model untuk outlet
 */

export interface Outlet {
  id: string;
  companyId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

