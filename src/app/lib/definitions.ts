export type TransactionForm = {
  id: string;
  isExpense: boolean;
  amount: number;
  note: string;
  establishment: string;
  category: string;
  isEssential: boolean;
  userId: number;
  transactionDate: Date;
};
