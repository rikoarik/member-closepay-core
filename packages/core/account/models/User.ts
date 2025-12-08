/**
 * Core Account - User Model
 * Model untuk user (extends dari core/auth User jika perlu)
 */

export interface User {
  id: string;
  companyId: string;
  outletId?: string;
  username: string;
  email?: string;
  name: string;
  role?: string;
  permissions?: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

