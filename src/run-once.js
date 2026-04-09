import { runPostJob } from "./post-job.js";

runPostJob()
  .then((report) => {
    console.log(JSON.stringify(report, null, 2));
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
