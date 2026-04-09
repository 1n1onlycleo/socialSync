import axios from "axios";
import { config } from "../config.js";

const graphApi = axios.create({
  baseURL: "https://graph.facebook.com/v23.0",
  timeout: 30000,
});

async function getCreationStatus(creationId) {
  const response = await graphApi.get(`/${creationId}`, {
    params: {
      fields: "status_code,status",
      access_token: config.instagramAccessToken,
    },
  });

  return response.data;
}

async function waitForContainerReady(creationId) {
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const status = await getCreationStatus(creationId);
    if (status.status_code === "FINISHED") {
      return;
    }

    if (status.status_code === "ERROR" || status.status === "ERROR") {
      throw new Error(`Instagram media container failed: ${JSON.stringify(status)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error("Instagram media container did not become ready in time.");
}

export async function publishInstagramImage({ imageUrl, caption }) {
  const createResponse = await graphApi.post(
    `/${config.instagramBusinessAccountId}/media`,
    null,
    {
      params: {
        image_url: imageUrl,
        caption,
        access_token: config.instagramAccessToken,
      },
    },
  );

  const creationId = createResponse.data.id;
  await waitForContainerReady(creationId);

  const publishResponse = await graphApi.post(
    `/${config.instagramBusinessAccountId}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: config.instagramAccessToken,
      },
    },
  );

  return {
    creationId,
    publishedMediaId: publishResponse.data.id,
  };
}
