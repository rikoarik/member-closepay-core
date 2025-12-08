/**
 * Core Config - useBalance Hook
 * Core hook for balance operations that uses the balance operations registry
 * Plugins should use this instead of directly importing from balance plugin
 */

import { useState, useEffect, useCallback } from 'react';
import { balanceOperationsRegistry, BalanceAccount } from './balance';

export interface UseBalanceReturn {
  balance: BalanceAccount | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Core hook for accessing balance
 * Uses balance operations registry to avoid direct plugin imports
 */
export const useBalance = (): UseBalanceReturn => {
  const [balance, setBalance] = useState<BalanceAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const balanceOps = balanceOperationsRegistry.get();
      if (!balanceOps) {
        throw new Error('Balance operations not available');
      }
      const balanceData = await balanceOps.getBalance();
      setBalance(balanceData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load balance'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    balance,
    isLoading,
    error,
    refresh,
  };
};

