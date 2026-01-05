/**
 * Core Balance - useBalance Hook
 * React hook untuk mengakses balance dan mutations
 */

import { useState, useEffect, useCallback } from 'react';
import { balanceService } from '../services/balanceService';
import { BalanceAccount } from '../models/BalanceAccount';
import { BalanceMutation, MutationFilters } from '../models/BalanceMutation';

export interface UseBalanceReturn {
  balance: BalanceAccount | null;
  mutations: BalanceMutation[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMutations: (filters?: MutationFilters) => Promise<void>;
}

export const useBalance = (): UseBalanceReturn => {
  const [balance, setBalance] = useState<BalanceAccount | null>(null);
  const [mutations, setMutations] = useState<BalanceMutation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const balanceData = await balanceService.getBalance();
      setBalance(balanceData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load balance'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMutations = useCallback(async (filters?: MutationFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const mutationsData = await balanceService.getMutations(filters);
      setMutations(mutationsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load mutations'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    balance,
    mutations,
    isLoading,
    error,
    refresh,
    loadMutations,
  };
};

