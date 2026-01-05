/**
 * Core Payment - Withdraw Service
 * Service untuk withdraw saldo
 */

import { WithdrawResult, WithdrawMethod, BankAccount } from '../types';
import { mutationService } from '../../balance/services/mutationService';
import { TransactionType } from '../../balance/models/TransactionType';

export interface WithdrawService {
  withdrawBalance(
    amount: number,
    method: WithdrawMethod,
    bankAccount: BankAccount
  ): Promise<WithdrawResult>;
}

class WithdrawServiceImpl implements WithdrawService {
  async withdrawBalance(
    amount: number,
    method: WithdrawMethod,
    bankAccount: BankAccount
  ): Promise<WithdrawResult> {
    // TODO: Implement withdraw balance
    // 1. Validate balance sufficient
    // 2. Process withdrawal via external gateway
    // 3. Create mutation via mutationService (type: WITHDRAW)
    // 4. Update balance
    // 5. Return result
    throw new Error('Not implemented');
  }
}

export const withdrawService: WithdrawService = new WithdrawServiceImpl();

