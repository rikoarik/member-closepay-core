/**
 * Core Payment - Transfer Service
 * Service untuk transfer saldo antar akun
 */

import { TransferResult } from '../types';
import { mutationService } from '../../balance/services/mutationService';
import { TransactionType } from '../../balance/models/TransactionType';

export interface TransferService {
  transferBalance(
    amount: number,
    toAccountId: string,
    description?: string
  ): Promise<TransferResult>;
}

class TransferServiceImpl implements TransferService {
  async transferBalance(
    amount: number,
    toAccountId: string,
    description?: string
  ): Promise<TransferResult> {
    // TODO: Implement transfer balance
    // 1. Validate balance sufficient
    // 2. Create mutation for sender (type: TRANSFER, amount: -amount)
    // 3. Create mutation for receiver (type: TRANSFER, amount: +amount)
    // 4. Update both balances
    // 5. Return result
    throw new Error('Not implemented');
  }
}

export const transferService: TransferService = new TransferServiceImpl();

