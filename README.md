# Itty Bitty RAG

A tiny demonstration of a Retrieval Augmented Generation (RAG) system in TypeScript. The goal of this project is to demonstrate the bare bones of a RAG system. No attempts have been made to make this robust, efficient, or scalable.

[LanceDB](https://lancedb.com/) is used as the vector database. [OpenAI](https://openai.com/) is used for the embeddings (`text-embedding-3-small`) and generating responses (`gpt-4o`).

The example dataset provided is a collection of transcripts from the [Lex Fridman Podcast](https://lexfridman.com/podcast/) generated using [Deepgram](https://deepgram.com/). There are 119 transcripts in the dataset, and they are quite long, resulting in a total of approximately 4,052,586 tokens. See the section [Indexing a subset of the data](#indexing-a-subset-of-the-data) below if you want to run this faster on a subset of the data.

If you'd like to skip building the LanceDB database you can download it from here: [ittybittyrag.lancedb.zip](https://pub-1fb4721bb25e43809c409679bb5bc583.r2.dev/ittybittyrag.lancedb.zip) (26MB download, 42MB uncompressed). Just unzip it in the root directory of this project.

## Usage

```bash
pnpm install
```

Add your OpenAI API key to `.env`:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Index the data:

```bash
pnpm run ingest
```

Do a search:

```bash
pnpm run search "What was said about physics?"
```

## Indexing

The `ingest.ts` script ingests transcripts from the `transcripts` directory and indexes them in a LanceDB database.

1. Load data
2. Convert data to text
3. Split text into chunks
4. Create embeddings for each chunk
5. Index embeddings in a vector database

## Search

The `search.ts` script takes a query and searches the vector database for relevant chunks, addes them to the prompt context, and passes the prompt to the LLM.

1. Take a query
2. Generate an embedding for the query
3. Retrieve relevant chunks from the vector database
4. Feed the chunks into the LLM prompt
5. Generate a response

## Misc

### Indexing a subset of the data

Edit the `ingest.ts` script to only index a subset of the data by changing this line:

```typescript
for (const file of files) {
```

to this (substitute `10` for the number of files you want to index):

```typescript
for (const file of files.slice(0, 10)) {
```
