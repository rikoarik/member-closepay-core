/**
 * Core Account - Company Model
 * Model untuk company
 */

export interface Company {
  id: string;
  name: string;
  segmentId?: string;
  config?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

