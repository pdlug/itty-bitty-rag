import fs from "node:fs";
import path from "node:path";

import lancedb from "vectordb";

import { embedText } from "./llm.js";

function windowedOverlapChunker(
  text: string,
  chunkSize: number = 1024,
  overlapSize: number = 10,
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let index = 0; index < words.length; index += chunkSize - overlapSize) {
    const chunk = words.slice(index, index + chunkSize).join(" ");
    chunks.push(chunk);
  }

  return chunks;
}

interface LanceDBRecord {
  id: string;
  filename: string;
  vector: number[];
  text: string;
}

const records: LanceDBRecord[] = [];

const transcriptDirectory = "./transcripts";
const files = fs
  .readdirSync(transcriptDirectory)
  .filter((file) => file.endsWith(".txt"));

for (const file of files) {
  const filename = path.join(transcriptDirectory, file);
  const text = fs.readFileSync(filename, "utf8");

  const chunks = windowedOverlapChunker(text);
  for (const chunk of chunks) {
    records.push({
      id: crypto.randomUUID(),
      filename,
      text: chunk,
      vector: await embedText(chunk),
    });
  }
}

const db = await lancedb.connect("ittybittyrag.lancedb");

await db.createTable({
  name: "text",
  data: records,
});
