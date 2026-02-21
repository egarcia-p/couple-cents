export type TransactionForm = {
  id: string;
  isExpense: boolean;
  amount: number;
  note: string;
  establishment: string;
  category: string;
  isEssential: boolean;
  userId: string;
  transactionDate: Date;
};

export type UserBudgetSettingForm = {
  id: number;
  userId: string;
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
  userId: string;
  category: string;
  budget: string;
};

export type UserSettings = {
  id: number;
  userId: string;
  language: string;
  timezone: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Categories = {
  [key: string]: string;
};
