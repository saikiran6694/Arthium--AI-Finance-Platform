import { startJobs } from "./schedular";

export const initialiseCron = async () => {
  try {
    const jobs = startJobs();
    console.log(`⏰ ${jobs.length} cron jobs initialized`);
  } catch (error) {
    console.log("CRON INIT ERROR: ", error);
    return [];
  }
};
