/**
 * Core Balance - Balance Mutation Model
 * Model untuk mutasi saldo (immutable ledger entry)
 */

import { TransactionType } from './TransactionType';

export interface BalanceMutation {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  balance: number; // Balance setelah transaksi
  description: string;
  referenceId?: string; // Reference ke transaction/payment
  createdAt: Date;
}

export interface MutationFilters {
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface BalanceHistory {
  startDate: Date;
  endDate: Date;
  startingBalance: number;
  endingBalance: number;
  mutations: BalanceMutation[];
  totalIn: number;
  totalOut: number;
}

