/**
 * Core Payment - Top Up Service
 * Service untuk top up saldo
 */

import { TopUpResult, TopUpMethod } from '../types';
import { mutationService } from '../../balance/services/mutationService';
import { TransactionType } from '../../balance/models/TransactionType';

export interface TopUpService {
  topUpBalance(
    amount: number,
    method: TopUpMethod,
    metadata?: Record<string, any>
  ): Promise<TopUpResult>;
}

class TopUpServiceImpl implements TopUpService {
  async topUpBalance(
    amount: number,
    method: TopUpMethod,
    metadata?: Record<string, any>
  ): Promise<TopUpResult> {
    // TODO: Implement top up balance
    // 1. Process payment via external gateway if needed
    // 2. Create mutation via mutationService (type: TOPUP)
    // 3. Update balance
    // 4. Return result
    throw new Error('Not implemented');
  }
}

export const topUpService: TopUpService = new TopUpServiceImpl();

