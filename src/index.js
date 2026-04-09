import cron from "node-cron";
import { config } from "./config.js";
import { runPostJob } from "./post-job.js";

console.log(
  `Scheduler started for vertical "${config.vertical}" with cron "${config.dailyPostCron}" in timezone "${config.timezone}".`,
);
console.log(`Dry run mode: ${config.dryRun}`);

cron.schedule(
  config.dailyPostCron,
  async () => {
    console.log(`[${new Date().toISOString()}] Starting daily post job.`);
    try {
      const report = await runPostJob();
      console.log(`[${new Date().toISOString()}] Job completed.`);
      console.log(JSON.stringify(report, null, 2));
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Job failed: ${error.message}`);
    }
  },
  {
    timezone: config.timezone,
  },
);
