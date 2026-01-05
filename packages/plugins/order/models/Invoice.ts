/**
 * Features Order - Invoice Model
 * Generic invoice model (single, master dengan installment)
 */

import { Installment } from './Installment';

export interface Invoice {
  id: string;
  orderId?: string;
  amount: number;
  paidAmount: number;
  type: 'single' | 'master';
  installments?: Installment[];
  status: 'unpaid' | 'partial' | 'paid';
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

