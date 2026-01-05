/**
 * Core Payment - Payment Service
 * Single gateway untuk semua operasi uang
 */

import { PaymentResult } from '../types';
import { balanceOperationsRegistry } from '@core/config/plugins/contracts/balance';

export interface PaymentService {
  payWithBalance(
    amount: number,
    orderId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult>;
}

class PaymentServiceImpl implements PaymentService {
  async payWithBalance(
    amount: number,
    orderId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    // Get balance operations from registry (no direct plugin import)
    const balanceOps = balanceOperationsRegistry.get();
    if (!balanceOps) {
      throw new Error('Balance operations not available');
    }

    // TODO: Implement payment with balance
    // 1. Validate balance sufficient
    const balance = await balanceOps.getBalance();
    if (balance.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // 2. Create mutation via balance operations registry
    await balanceOps.createMutation({
      accountId: balance.id,
      type: 'debit',
      amount: amount,
      description: `Payment for order ${orderId || 'N/A'}`,
      metadata: { orderId, ...metadata },
    });

    // 3. Get updated balance and return result
    const updatedBalance = await balanceOps.getBalance();
    return {
      transactionId: `txn_${Date.now()}`,
      amount,
      newBalance: updatedBalance.balance,
      status: 'success' as const,
    };
  }
}

export const paymentService: PaymentService = new PaymentServiceImpl();

