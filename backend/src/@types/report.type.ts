export type ReportType = {
  period: string;
  total_income: number;
  total_expenses: number;
  available_balance: number;
  saving_rate: number;
  top_spending_categories: Array<{ name: string; percent: number }>;
  insights: string[];
};
