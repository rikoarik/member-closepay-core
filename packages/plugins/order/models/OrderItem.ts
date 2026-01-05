/**
 * Features Order - OrderItem Model
 * Model untuk item dalam order
 */

import { Variant } from '../../catalog/models/Variant';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant?: Variant;
}

