import axios from "axios";
import { config } from "../config.js";

const fallbackThoughts = {
  motivation: [
    "Small progress made daily becomes a life people call discipline.",
    "Consistency is ambition that learned how to stay calm.",
    "The habit you repeat quietly decides the results people notice loudly.",
  ],
  fitness: [
    "You do not need the perfect workout, only the next honest one.",
    "Strength grows when you keep promises to yourself.",
    "A healthy routine is built by repetition, not intensity alone.",
  ],
  finance: [
    "Wealth often starts with restraint before it becomes freedom.",
    "A budget is not a limit, it is a decision made early.",
    "The future gets cheaper when discipline gets stronger.",
  ],
  startup: [
    "Ship the useful version before you dream about the perfect version.",
    "Momentum is usually more valuable than hidden polish.",
    "Clarity beats excitement when building for real customers.",
  ],
};

function randomFallback(vertical) {
  const set = fallbackThoughts[vertical] ?? fallbackThoughts.motivation;
  return set[Math.floor(Math.random() * set.length)];
}

function normalizeResponse(text, vertical) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const quote = lines[0]?.replace(/^["']|["']$/g, "") || randomFallback(vertical);
  const caption = lines.slice(1).join("\n").trim();

  return {
    quote,
    caption:
      caption ||
      `${quote}\n\nDaily ${vertical} thought.\n\n#thoughtoftheday #${vertical.replace(/\s+/g, "")} #dailymotivation`,
  };
}

export async function generateThoughtOfTheDay(vertical) {
  if (!config.geminiApiKey) {
    const quote = randomFallback(vertical);
    return {
      quote,
      caption: `${quote}\n\nDaily ${vertical} thought.\n\n#thoughtoftheday #${vertical.replace(/\s+/g, "")}`,
      source: "fallback",
    };
  }

  const prompt = [
    `You are generating a daily Instagram post for the vertical "${vertical}".`,
    "Return plain text only.",
    "Line 1: a short original thought of the day, under 20 words, powerful and simple.",
    "Remaining lines: an Instagram-ready caption under 2200 characters with 5-8 relevant hashtags.",
    "Do not use quotation marks around the first line.",
    "Avoid cliches and avoid mentioning that an AI wrote it.",
  ].join("\n");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const response = await axios.post(
    `${url}?key=${config.geminiApiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    },
  );

  const text =
    response.data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") ?? "";

  const parsed = normalizeResponse(text, vertical);
  return { ...parsed, source: "gemini" };
}
