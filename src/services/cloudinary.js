import fs from "node:fs/promises";
import { config } from "../config.js";
import { sha1 } from "../utils.js";

export async function uploadImageToCloudinary(filePath) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureBase = `timestamp=${timestamp}${config.cloudinaryApiSecret}`;
  const signature = sha1(signatureBase);
  const buffer = await fs.readFile(filePath);

  const form = new FormData();
  form.append("file", new Blob([buffer]), "thought.png");
  form.append("api_key", config.cloudinaryApiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Cloudinary upload failed: ${response.status} ${message}`);
  }

  const data = await response.json();
  return {
    publicId: data.public_id,
    imageUrl: data.secure_url,
  };
}
