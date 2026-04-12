export interface FilterParams {
  preset?: string;
  from?: string;
  to?: string;
}

interface PercentageChange {
  income: number;
  expenses: number;
  balance: number;
  prev_period_from: string | null;
  prev_period_to: string | null;
}

interface PresetType {
  from: string;
  to: string;
  value: string;
  label: string;
}

export interface SummaryAnalyticsResponse {
  message: string;
  stats: {
    available_balance: number;
    total_income: number;
    total_expenses: number;
    transaction_count: number;
    saving_rate: {
      percentage: number;
      expense_ratio: number;
    },
    percentage_change: PercentageChange;
    preset: PresetType
  };
}

export interface ChartAnalyticsResponse {
  message: string;
  stats: {
    chart_data: {
      date: string;
      income: number;
      expenses: number;
    }[];
    total_income_count: number;
    total_expense_count: number;
    preset: PresetType;
  };
}

export interface ExpensePieChartBreakdownResponse {
  message: string;
  stats: {
    total_spent: number;
    breakdown: {
      name: string;
      value: number;
      percentage: number;
    }[];
    preset: PresetType;
  };
}
