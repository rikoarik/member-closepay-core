/**
 * Features Order - Cart Model
 * Model untuk shopping cart
 */

import { OrderItem } from './OrderItem';

export interface Cart {
  id?: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  updatedAt: Date;
}

