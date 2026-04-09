import path from "node:path";
import { config, getMissingConfig } from "./config.js";
import { generateThoughtOfTheDay } from "./services/content-generator.js";
import { renderThoughtImage } from "./services/image-renderer.js";
import { uploadImageToCloudinary } from "./services/cloudinary.js";
import { publishInstagramImage } from "./services/instagram.js";
import { timestampId, writeJson } from "./utils.js";

export async function runPostJob() {
  const includePublishing = !config.dryRun;
  const missing = getMissingConfig(includePublishing);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const generated = await generateThoughtOfTheDay(config.vertical);
  const imagePath = await renderThoughtImage({
    quote: generated.quote,
    vertical: config.vertical,
  });

  let cloudinary = null;
  if (config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret) {
    cloudinary = await uploadImageToCloudinary(imagePath);
  }

  let publishResult = null;
  if (!config.dryRun) {
    if (!cloudinary?.imageUrl) {
      throw new Error("Publishing requires Cloudinary credentials so Instagram can access a public image URL.");
    }

    publishResult = await publishInstagramImage({
      imageUrl: cloudinary.imageUrl,
      caption: generated.caption,
    });
  }

  const report = {
    runAt: new Date().toISOString(),
    dryRun: config.dryRun,
    vertical: config.vertical,
    contentSource: generated.source,
    quote: generated.quote,
    caption: generated.caption,
    imagePath,
    imageUrl: cloudinary?.imageUrl ?? null,
    publishResult,
  };

  await writeJson(path.resolve("output", `${timestampId()}-report.json`), report);
  return report;
}
