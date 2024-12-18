import lancedb from "@lancedb/lancedb";

import { embedText, runPrompt } from "./llm.js";

async function retrieveRelevantChunks(table: lancedb.Table, query: string) {
  const embeddedQuery = await embedText(query);
  const results = await table.vectorSearch(embeddedQuery);
  const resultArray = await results.toArray();

  return resultArray.map((result) => result.text);
}

async function search(table: lancedb.Table, query: string) {
  const systemPrompt = `You are a helpful assistant. Given the USER QUERY return a response using only the information containted in the CONTEXT below. If the CONTEXT doesn't contain any information to answer the USER QUERY, respond with "I'm sorry, I don't have an answer for that."`;

  const chunks = await retrieveRelevantChunks(table, query);
  const prompt = `CONTEXT:\n${chunks.join("\n")}\n\nUSER QUERY:\n${query}\n\n`;

  return runPrompt(systemPrompt, prompt);
}

const query = process.argv.at(-1);
if (!query) {
  console.error("Usage: search.ts <query>");
  process.exit(1);
}

const db = await lancedb.connect("ittybittyrag.lancedb");
const table = await db.openTable("text");

const response = await search(table, query);
console.log(response);
