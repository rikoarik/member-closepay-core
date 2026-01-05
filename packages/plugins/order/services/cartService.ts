/**
 * Features Order - Cart Service
 * Service untuk mengelola shopping cart
 */

import { Cart } from '../models/Cart';
import { OrderItem } from '../models/OrderItem';

export interface CartService {
  getCart(): Promise<Cart>;
  addToCart(item: OrderItem): Promise<Cart>;
  updateCartItem(productId: string, quantity: number): Promise<Cart>;
  removeFromCart(productId: string): Promise<Cart>;
  clearCart(): Promise<void>;
  calculateTotal(cart: Cart): Cart;
}

class CartServiceImpl implements CartService {
  async getCart(): Promise<Cart> {
    // TODO: Implement get cart from storage or API
    throw new Error('Not implemented');
  }

  async addToCart(item: OrderItem): Promise<Cart> {
    // TODO: Implement add item to cart
    throw new Error('Not implemented');
  }

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    // TODO: Implement update cart item
    throw new Error('Not implemented');
  }

  async removeFromCart(productId: string): Promise<Cart> {
    // TODO: Implement remove item from cart
    throw new Error('Not implemented');
  }

  async clearCart(): Promise<void> {
    // TODO: Implement clear cart
    throw new Error('Not implemented');
  }

  calculateTotal(cart: Cart): Cart {
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + (cart.tax || 0) - (cart.discount || 0);
    return {
      ...cart,
      subtotal,
      total,
      updatedAt: new Date(),
    };
  }
}

export const cartService: CartService = new CartServiceImpl();

