import dotenv from "dotenv";

dotenv.config();

function must(name, fallback = "") {
  return process.env[name] ?? fallback;
}

export const config = {
  vertical: must("VERTICAL", "motivation"),
  brandName: must("BRAND_NAME", "Thought Loop"),
  timezone: must("TIMEZONE", "Asia/Singapore"),
  dailyPostCron: must("DAILY_POST_CRON", "0 9 * * *"),
  dryRun: must("DRY_RUN", "true").toLowerCase() === "true",
  geminiApiKey: must("GEMINI_API_KEY"),
  instagramBusinessAccountId: must("INSTAGRAM_BUSINESS_ACCOUNT_ID"),
  instagramAccessToken: must("INSTAGRAM_ACCESS_TOKEN"),
  cloudinaryCloudName: must("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: must("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: must("CLOUDINARY_API_SECRET"),
};

export function getMissingConfig(includePublishing = true) {
  const required = [];

  if (includePublishing) {
    required.push(
      ["CLOUDINARY_CLOUD_NAME", config.cloudinaryCloudName],
      ["CLOUDINARY_API_KEY", config.cloudinaryApiKey],
      ["CLOUDINARY_API_SECRET", config.cloudinaryApiSecret],
      ["INSTAGRAM_BUSINESS_ACCOUNT_ID", config.instagramBusinessAccountId],
      ["INSTAGRAM_ACCESS_TOKEN", config.instagramAccessToken],
    );
  }

  return required.filter(([, value]) => !value).map(([name]) => name);
}
