import { config, getMissingConfig } from "./config.js";

const missingForDryRun = getMissingConfig(false);
const missingForPublish = getMissingConfig(true);

console.log(
  JSON.stringify(
    {
      vertical: config.vertical,
      timezone: config.timezone,
      dailyPostCron: config.dailyPostCron,
      dryRun: config.dryRun,
      missingForDryRun,
      missingForPublish,
    },
    null,
    2,
  ),
);
