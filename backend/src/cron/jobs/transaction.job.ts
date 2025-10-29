import mongoose from "mongoose";
import TransactionModel from "../../models/transaction.model";
import { calculateNextOccurance } from "../../utils/helper";

export const processRecurringTransaction = async () => {
  const now = new Date();
  let processedCount = 0;
  let failedCount = 0;

  try {
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).cursor();

    console.log("Starting recurring transactions");

    for await (const tx of transactionCursor) {
      const nextDate = calculateNextOccurance(tx.nextRecurringDate!, tx.recurringInterval!);

      const session = await mongoose.startSession();

      try {
        await session.withTransaction(
          async () => {
            await TransactionModel.create(
              [
                {
                  ...tx.toObject(),
                  _id: new mongoose.Types.ObjectId(),
                  title: `Recurring - ${tx.title}`,
                  date: tx.nextRecurringDate,
                  isRecurring: false,
                  nextRecurringDate: null,
                  recurringInterval: null,
                  lastProcessed: null,
                  createdAt: undefined,
                  updatedAt: undefined,
                },
              ],
              { session }
            );

            await TransactionModel.updateOne(
              { _id: tx._id },
              {
                $set: {
                  nextRecurringDate: nextDate,
                  lastProcessed: now,
                },
              },
              { session }
            );
          },
          {
            maxCommitTimeMS: 20000,
          }
        );

        processedCount++;
      } catch (error: any) {
        failedCount++;
        console.log(`Failed recurring tx: ${tx._id} `, error?.message);
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅ Processed: ${processedCount} transaction`);
    console.log(`❌ Failed ${failedCount} transactions`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error: any) {
    console.log("Error while processing transactions ", error);

    return {
      success: false,
      error: error?.message,
    };
  }
};
