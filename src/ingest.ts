import fs from "node:fs";
import path from "node:path";

import lancedb from "@lancedb/lancedb";

import { embedTexts } from "./llm.js";

function windowedOverlapChunker(
  text: string,
  chunkSize = 1024,
  overlapSize = 10,
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let index = 0; index < words.length; index += chunkSize - overlapSize) {
    const chunk = words.slice(index, index + chunkSize).join(" ");
    chunks.push(chunk);
  }

  return chunks;
}

type LanceDBRecord = Readonly<{
  id: string;
  filename: string;
  vector: number[];
  text: string;
}>;

const transcriptDirectory = "./transcripts";
const files = fs
  .readdirSync(transcriptDirectory)
  .filter((file) => file.endsWith(".txt"));

const chunks: { filename: string; text: string }[] = [];

for (const file of files) {
  const filename = path.join(transcriptDirectory, file);
  const text = fs.readFileSync(filename, "utf8");

  for (const chunk of windowedOverlapChunker(text)) {
    chunks.push({ filename, text: chunk });
  }
}

console.log(
  `Embedding ${String(chunks.length)} chunks from ${String(files.length)} files...`,
);

const vectors = await embedTexts(chunks.map((c) => c.text));

const records: LanceDBRecord[] = chunks.map((chunk, index) => ({
  id: crypto.randomUUID(),
  filename: chunk.filename,
  text: chunk.text,
  vector: vectors[index],
}));

console.log("Writing to LanceDB...");

const db = await lancedb.connect("ittybittyrag.lancedb");

await db.createTable({
  name: "text",
  data: records,
});

console.log("Done.");
