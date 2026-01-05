/**
 * Features Order - Order Model
 * Generic order model
 */

import { OrderItem } from './OrderItem';

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax?: number;
  discount?: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  invoiceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

