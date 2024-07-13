import OpenAI from "openai";

import env from "./env.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function embedText(text: string) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  return embedding.data[0].embedding;
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
