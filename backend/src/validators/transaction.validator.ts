import { z } from "zod";
import { PaymentMethodEnum, RecurringIntervalEnum, TransactionEnumType, TransactionStatusEnum } from "../models/transaction.model";

export const baseTransactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum([TransactionEnumType.INCOME, TransactionEnumType.EXPENSE], {
    errorMap: () => ({
      message: "Transaction type must be either EXPENSE or INCOME",
    }),
  }),
  amount: z.number().positive("Amount must be positive").min(1),
  category: z.string().min(1, "Category is required"),
  date: z.union([z.string().datetime({ message: "Invalid date string" }), z.date()]).transform((val) => new Date(val)),
  isRecurring: z.boolean().default(false),
  recurringInterval: z
    .enum([RecurringIntervalEnum.DAILY, RecurringIntervalEnum.WEEKLY, RecurringIntervalEnum.MONTHLY, RecurringIntervalEnum.YEARLY])
    .nullable()
    .optional(),
  description: z.string().max(250, "Description should not exceed 250 characters").optional(),
  receiptUrl: z.string().optional(),
  paymentMethod: z
    .enum([
      PaymentMethodEnum.CASH,
      PaymentMethodEnum.AUTO_DEBIT,
      PaymentMethodEnum.BANK_TRANSFER,
      PaymentMethodEnum.CARD,
      PaymentMethodEnum.MOBILE_PAYMENT,
      PaymentMethodEnum.AUTO_DEBIT,
    ])
    .default(PaymentMethodEnum.CASH),
});

export const transactionIdSchema = z.string().min(1, "Id is required");
export const bulkDeleteTransactionIdsSchema = z.object({
  transactionIds: z.array(z.string().length(24, "Invalid transaction ID")).min(1, "Atleat one transaction ID must be provided"),
});

export const bulkTransactionSchema = z.object({
  transactions: z
    .array(baseTransactionSchema)
    .min(1, "At least one transaction is required")
    .max(300, "Must not be more than 300 transactions")
    .refine(
      (txs) =>
        txs.every((tx) => {
          const amount = Number(tx.amount);
          return !isNaN(amount) && amount > 0 && amount <= 1_000_000_000;
        }),
      {
        message: "Amount must be a postive number",
      }
    ),
});

export const createTransactionSchema = baseTransactionSchema;

export const updateTransactionSchema = baseTransactionSchema.partial();

export type CreateTransactionType = z.infer<typeof createTransactionSchema>;

export type UpdateTransactionType = z.infer<typeof updateTransactionSchema>;

export type BulkTransactionType = z.infer<typeof bulkTransactionSchema>;
