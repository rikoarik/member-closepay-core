/**
 * Core Balance - Mutation Service
 * Service untuk operasi mutasi (internal use, biasanya dipanggil dari payment service)
 */

import { BalanceMutation, TransactionType } from '../models/BalanceMutation';

export interface MutationService {
  createMutation(
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<BalanceMutation>;
}

class MutationServiceImpl implements MutationService {
  async createMutation(
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    referenceId?: string
  ): Promise<BalanceMutation> {
    // TODO: Implement API call to create mutation
    // This should be called from payment service, not directly from UI
    throw new Error('Not implemented');
  }
}

export const mutationService: MutationService = new MutationServiceImpl();

