/**
 * Core Payment - Card Transaction Service
 * Service untuk transaksi kartu
 */

import { CardTransactionResult, CardData } from '../types';
import { mutationService } from '../../balance/services/mutationService';
import { TransactionType } from '../../balance/models/TransactionType';

export interface CardTransactionService {
  processCardTransaction(
    amount: number,
    cardData: CardData
  ): Promise<CardTransactionResult>;
}

class CardTransactionServiceImpl implements CardTransactionService {
  async processCardTransaction(
    amount: number,
    cardData: CardData
  ): Promise<CardTransactionResult> {
    // TODO: Implement card transaction
    // 1. Process card payment via external gateway
    // 2. Create mutation via mutationService (type: PAYMENT)
    // 3. Update balance
    // 4. Return result
    throw new Error('Not implemented');
  }
}

export const cardTransactionService: CardTransactionService = new CardTransactionServiceImpl();

