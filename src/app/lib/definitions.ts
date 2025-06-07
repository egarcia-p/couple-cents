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

export type UserBudgetSettingForm = {
  id: number;
  userId: number;
  category: string;
  budget: number;
};

export type ExpenseDataMonth = [
  {
    month: string;
    total: number;
  },
];

export type UserBudgetSetting = {
  id: number;
  userId: number;
  category: string;
  budget: string;
};
