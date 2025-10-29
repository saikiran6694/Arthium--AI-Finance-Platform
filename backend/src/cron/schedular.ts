import cron from "node-cron";
import { processRecurringTransaction } from "./jobs/transaction.job";
import { processReportJob } from "./jobs/report.job";

const schedularJob = (name: string, time: string, job: Function) => {
  console.log(`Scheduling ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        console.log(`${name} completed`);
      } catch (error) {
        console.log(`${name} failed`, error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
};

export const startJobs = () => {
  return [schedularJob("transactions", "5 0 1 * *", processRecurringTransaction), schedularJob("reports", "30 2 1 * *", processReportJob)];
};
