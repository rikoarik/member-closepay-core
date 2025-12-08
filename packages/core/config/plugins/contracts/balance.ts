/**
 * Core Config - Balance Operations Contract
 * Core abstraction for balance operations that plugins can use
 * This allows plugins to depend on balance functionality without direct plugin imports
 */

export interface BalanceAccount {
  id: string;
  balance: number;
  currency: string;
}

export interface BalanceMutation {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface BalanceOperations {
  /**
   * Get current balance
   */
  getBalance(): Promise<BalanceAccount>;
  
  /**
   * Create a balance mutation
   */
  createMutation(mutation: Omit<BalanceMutation, 'id' | 'createdAt'>): Promise<BalanceMutation>;
}

/**
 * Balance operations registry
 * Plugins can register their balance operations implementation here
 */
class BalanceOperationsRegistry {
  private operations: BalanceOperations | null = null;

  register(operations: BalanceOperations): void {
    this.operations = operations;
  }

  get(): BalanceOperations | null {
    return this.operations;
  }
}

export const balanceOperationsRegistry = new BalanceOperationsRegistry();

