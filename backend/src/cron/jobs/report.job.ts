import { endOfMonth, format, startOfMonth, subMinutes, subMonths } from "date-fns";
import ReportModel, { ReportStatusEnum } from "../../models/report.model";
import ReportSettingModel from "../../models/report-settings.model";
import { UserDocument } from "../../models/user.model";
import mongoose from "mongoose";
import { generateReportService } from "../../services/reports.service";
import { calulateNextReportDate } from "../../utils/helper";
import { sendReportEmail } from "../../mailers/report.mailer";

export const processReportJob = async () => {
  const now = new Date();

  const from = startOfMonth(subMinutes(now, 1));
  const to = endOfMonth(subMonths(now, 1));

  let processedCount = 0;
  let failedCount = 0;

  try {
    const reportCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate<{ userId: UserDocument }>("userId")
      .cursor();

    console.log("Report Running: ");

    for await (const setting of reportCursor) {
      const user = setting.userId as UserDocument;

      if (!user) {
        console.log(`User not found for setting: ${setting._id}`);
        continue;
      }

      const session = await mongoose.startSession();

      try {
        const report = await generateReportService(user.id, from, to);

        let emailSent = false;

        if (report) {
          try {
            // send email
            await sendReportEmail({
              email: user.email!,
              username: user.name!,
              frequency: setting.frequency!,
              report: {
                period: report.period,
                totalIncome: report.summary.income,
                totalExpenses: report.summary.expenses,
                availableBalance: report.summary.balance,
                savingsRate: report.summary.savingsRate,
                topSpendingCategories: report.summary.topCategories,
                insights: report.insights,
              },
            });
            
            emailSent = true;
          } catch (error) {
            console.log(`Email failed for user ${user.id}`);
          }
        }

        await session.withTransaction(
          async () => {
            const bulkReports: any[] = [];
            const bulkSettings: any[] = [];

            if (report && emailSent) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: {
                    _id: setting._id,
                  },
                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate: calulateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            } else {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period: report?.period || `${format(from, "MMMM d")}-${format(to, "d yyyy")}}`,
                    status: report ? ReportStatusEnum.FAILED : ReportStatusEnum.NO_ACTIVITY,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: {
                    _id: setting._id,
                  },
                  update: {
                    $set: {
                      lastSentDate: null,
                      nextReportDate: calulateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            }

            await Promise.all([
              ReportModel.bulkWrite(bulkReports, { ordered: false }),
              ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          {
            maxCommitTimeMS: 10000,
          }
        );

        processedCount++;
      } catch (error: any) {
        failedCount++;
        console.log(`Failed recurring tx: ${setting._id} `, error?.message);
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅ Processed: ${processedCount} reports`);
    console.log(`❌ Failed ${failedCount} reports`);

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
