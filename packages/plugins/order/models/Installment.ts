/**
 * Features Order - Installment Model
 * Model untuk cicilan invoice
 */

export interface Installment {
  id: string;
  amount: number;
  dueDate: Date;
  status: 'unpaid' | 'paid';
  paidAt?: Date;
}

