/**
 * Core Payment - Types
 * Types untuk payment operations
 */

export interface PaymentResult {
  transactionId: string;
  amount: number;
  newBalance: number;
  status: 'success' | 'pending' | 'failed';
  message?: string;
}

export interface TopUpResult extends PaymentResult {
  method: TopUpMethod;
}

export interface WithdrawResult extends PaymentResult {
  method: WithdrawMethod;
  bankAccount: BankAccount;
}

export interface TransferResult extends PaymentResult {
  toAccountId: string;
  toAccountName?: string;
}

export interface CardTransactionResult extends PaymentResult {
  cardData: CardData;
}

export type TopUpMethod = 
  | 'bank-transfer'
  | 'credit-card'
  | 'e-wallet'
  | 'waste-bank'
  | 'other';

export type WithdrawMethod = 
  | 'bank-transfer'
  | 'e-wallet'
  | 'other';

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface CardData {
  cardNumber: string;
  cardHolderName?: string;
  expiryDate?: string;
  cvv?: string;
}

