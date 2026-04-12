import { _TRANSACTION_FREQUENCY, _TransactionType, PAYMENT_METHODS_ENUM } from "@/constant";

type RecurringIntervalType = (typeof _TRANSACTION_FREQUENCY)[keyof typeof _TRANSACTION_FREQUENCY];
type PaymentMethodType = (typeof PAYMENT_METHODS_ENUM)[keyof typeof PAYMENT_METHODS_ENUM];

export interface CreateTransactionBody {
  title: string;
  type: _TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  is_recurring: boolean;
  recurring_interval?: RecurringIntervalType | null;
  payment_method: string;
}

export interface GetAllTransactionParams {
  keyword?: string;
  type?: _TransactionType;
  recurring_status?: "RECURRING" | "NON_RECURRING";
  page_number?: number;
  page_size?: number;
}

export interface TransactionType {
  _id: string;
  userId: string;
  title: string;
  type: _TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  is_recurring: boolean;
  recurring_interval: RecurringIntervalType | null;
  next_recurring_date: string | null;
  last_processed: string | null;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  id?: string;
}

export interface GetAllTransactionResponse {
  message: string;
  transactions: TransactionType[];
  pagination: {
    page_size: number;
    page_number: number;
    total_count: number;
    total_pages: number;
    skip: number;
  };
}

export interface AIScanReceiptData {
  title: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  payment_method: string;
  type: "INCOME" | "EXPENSE";
  receip_url: string;
}

export interface AIScanReceiptResponse {
  message: string;
  data: AIScanReceiptData;
}

export interface GetSingleTransactionResponse {
  message: string;
  transaction: TransactionType;
}

export interface UpdateTransactionPayload {
  id: string;
  transaction: CreateTransactionBody;
}

export interface BulkTransactionType {
  title: string;
  type: _TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  payment_method: PaymentMethodType;
  is_recurring: boolean;
}

export interface BulkImportTransactionPayload {
  transactions: BulkTransactionType[];
}
