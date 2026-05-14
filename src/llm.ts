import OpenAI from "openai";

import env from "./env.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function embedText(text: string) {
  const [vector] = await embedTexts([text]);
  return vector;
}

const EMBED_BATCH_SIZE = 128;

const MAX_RETRIES = 5;

async function embedBatch(batch: string[]): Promise<number[][]> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
        encoding_format: "float",
      });
      return response.data.map((item) => item.embedding);
    } catch (error) {
      if (error instanceof OpenAI.RateLimitError && attempt < MAX_RETRIES - 1) {
        const waitSeconds = Math.pow(2, attempt + 1);
        console.log(`Rate limited, retrying in ${String(waitSeconds)}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Unreachable");
}

export async function embedTexts(texts: string[]) {
  const vectors: number[][] = [];

  for (let index = 0; index < texts.length; index += EMBED_BATCH_SIZE) {
    const batch = texts.slice(index, index + EMBED_BATCH_SIZE);
    const batchVectors = await embedBatch(batch);
    vectors.push(...batchVectors);
    console.log(
      `  ${String(Math.min(index + EMBED_BATCH_SIZE, texts.length))}/${String(texts.length)}`,
    );
  }

  return vectors;
}

export async function runPrompt(systemPrompt: string, prompt: string) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    model: "gpt-4o",
  });

  return completion.choices[0].message.content;
}
