/**
 * Core Balance Module
 * Export semua types, models, services, hooks, dan components
 */

import { balanceOperationsRegistry, BalanceOperations } from '@core/config/plugins/contracts/balance';
import { balanceService } from './services/balanceService';
import { mutationService } from './services/mutationService';
import { BalanceAccount, BalanceMutation } from './models/BalanceAccount';
import { TransactionType } from './models/TransactionType';

// Register balance operations with core registry
const balanceOps: BalanceOperations = {
  async getBalance(): Promise<BalanceAccount> {
    return await balanceService.getBalance();
  },
  async createMutation(mutation: Omit<BalanceMutation, 'id' | 'createdAt'>): Promise<BalanceMutation> {
    // Map to mutation service format
    return await mutationService.createMutation(
      mutation.accountId,
      mutation.type === 'credit' ? TransactionType.CREDIT : TransactionType.DEBIT,
      mutation.amount,
      mutation.description || '',
      mutation.metadata?.referenceId
    );
  },
};

// Register on module load
balanceOperationsRegistry.register(balanceOps);

export * from './models/TransactionType';
export * from './models/BalanceAccount';
export * from './models/BalanceMutation';
export * from './services/balanceService';
export * from './services/mutationService';
export * from './hooks/useBalance';
export * from './components/TransactionHistoryScreen';
export * from './components/WithdrawIcon';
export * from './components/TopUpIcon';
export * from './components/BalanceCard';
export * from './components/TransactionItem';
export * from './components/TransactionList';

