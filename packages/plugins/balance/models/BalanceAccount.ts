/**
 * Core Balance - Balance Account Model
 * Model untuk akun saldo
 */

export interface BalanceAccount {
  id: string;
  companyId: string;
  balance: number;
  currency: 'IDR';
  updatedAt: Date;
}

