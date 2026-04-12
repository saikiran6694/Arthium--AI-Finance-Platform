import { ChatMode } from "@/pages/ai-chat/types";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";

export const MAX_IMPORT_LIMIT = 300;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const SIDEBAR_KEY = "sidebar_collapsed";
export const MAX_HISTORY = 50;


export const MODE_SUGGESTIONS: Record<ChatMode, string[]> = {
  general: [
    "What did I spend this month?",
    "Show my top spending categories",
    "How has my income vs expenses changed?",
    "Am I saving enough?",
  ],
  advice: [
    "Should I cut any subscriptions?",
    "Where am I overspending?",
    "How can I improve my savings rate?",
    "Analyse my spending habits",
  ],
  simulator: [
    "What if I cut dining by 30%?",
    "What if I cancel Netflix and Spotify?",
    "What if I increase my income by $500?",
    "What if I reduce shopping by 50%?",
  ],
}

export const SEVERITY_CONFIG = {
  high: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/8 border-red-500/20", badge: "bg-red-500/15 text-red-400" },
  medium: { icon: Info, color: "text-amber-400", bg: "bg-amber-500/8 border-amber-400/20", badge: "bg-amber-500/15 text-amber-400" },
  low: { icon: Lightbulb, color: "text-blue-400", bg: "bg-blue-500/8 border-blue-400/20", badge: "bg-blue-500/15 text-blue-400" },
};

export const VERDICT_CONFIG = {
  great: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/25", label: "Great Move! 🎉" },
  good: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-400/25", label: "Good Idea 👍" },
  neutral: { color: "text-muted-foreground", bg: "bg-muted/50 border-border", label: "Neutral Impact" },
  risky: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-400/25", label: "Proceed Carefully ⚠️" },
};

export const CHART_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];


export const CATEGORIES = [
  { value: "groceries", label: "Groceries" },
  { value: "dining", label: "Dining & Restaurants" },
  { value: "transportation", label: "Transportation" },
  { value: "utilities", label: "Utilities" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "healthcare", label: "Healthcare" },
  { value: "travel", label: "Travel" },
  { value: "housing", label: "Housing & Rent" },
  { value: "income", label: "Income" },
  { value: "investments", label: "Investments" },
  { value: "other", label: "Other" },
];

export const PAYMENT_METHODS_ENUM = {
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  MOBILE_PAYMENT: "MOBILE_PAYMENT",
  CASH: "CASH",
  AUTO_DEBIT: "AUTO_DEBIT",
  OTHER: "OTHER",
} as const;

export const PAYMENT_METHODS = [
  { value: PAYMENT_METHODS_ENUM.CARD, label: "Credit/Debit Card" },
  { value: PAYMENT_METHODS_ENUM.CASH, label: "Cash" },
  { value: PAYMENT_METHODS_ENUM.BANK_TRANSFER, label: "Bank Transfer" },
  { value: PAYMENT_METHODS_ENUM.MOBILE_PAYMENT, label: "Mobile Payment" },
  { value: PAYMENT_METHODS_ENUM.AUTO_DEBIT, label: "Auto Debit" },
  { value: PAYMENT_METHODS_ENUM.OTHER, label: "Other" },
];

export const _TRANSACTION_FREQUENCY = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
} as const;

export type TransactionFrequencyType = keyof typeof _TRANSACTION_FREQUENCY;

export const _TRANSACTION_TYPE = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type _TransactionType = keyof typeof _TRANSACTION_TYPE;

export const _TRANSACTION_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type TransactionStatusType = keyof typeof _TRANSACTION_STATUS;

export const _REPORT_STATUS = {
  SENT: "SENT",
  FAILED: "FAILED",
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  NO_ACTIVITY: "NO_ACTIVITY",
} as const;

export type ReportStatusType = keyof typeof _REPORT_STATUS;
