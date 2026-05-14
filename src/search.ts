import lancedb from "@lancedb/lancedb";

import { embedText, runPrompt } from "./llm.js";

type RetrievedChunk = Readonly<{
  filename: string;
  text: string;
  _distance: number;
}>;

const SNIPPET_LENGTH = 200;

async function retrieveRelevantChunks(
  table: lancedb.Table,
  query: string,
): Promise<RetrievedChunk[]> {
  const embeddedQuery = await embedText(query);
  const results = table
    .vectorSearch(embeddedQuery)
    .select(["text", "filename", "_distance"]);
  return (await results.toArray()) as RetrievedChunk[];
}

function printRetrieval(chunks: readonly RetrievedChunk[]) {
  console.log(`Retrieved ${String(chunks.length)} chunks:`);
  for (const [index, chunk] of chunks.entries()) {
    const position = String(index + 1).padStart(2);
    const distance = chunk._distance.toFixed(4);
    const snippet = chunk.text.slice(0, SNIPPET_LENGTH).replaceAll(/\s+/g, " ");
    const ellipsis = chunk.text.length > SNIPPET_LENGTH ? "..." : "";
    console.log(`  [${position}] ${chunk.filename} (distance: ${distance})`);
    console.log(`       ${snippet}${ellipsis}`);
  }
}

async function search(table: lancedb.Table, query: string) {
  const systemPrompt = `You are a helpful assistant. Given the USER QUERY return a response using only the information containted in the CONTEXT below. If the CONTEXT doesn't contain any information to answer the USER QUERY, respond with "I'm sorry, I don't have an answer for that."`;

  const chunks = await retrieveRelevantChunks(table, query);
  printRetrieval(chunks);

  const context = chunks.map((c) => c.text).join("\n");
  const prompt = `CONTEXT:\n${context}\n\nUSER QUERY:\n${query}\n\n`;

  console.log("\nAnswer:");
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
