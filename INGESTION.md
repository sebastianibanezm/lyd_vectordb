# Vector Database Ingestion Guide

This document explains how to use the PDF ingestion scripts to process reports and store them in the Supabase vector database.

## Prerequisites

- Node.js 18+ installed
- Valid Supabase credentials in `.env.local` file
- OpenAI API key for generating embeddings

## Environment Variables

Make sure your `.env.local` file contains the following variables:

```
SUPABASE_API_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-key
OPENAI_API_KEY=your-openai-api-key
```

## Ingestion Scripts

### Direct Ingestion

The `direct-ingest.mjs` script is the recommended way to ingest PDFs directly from Supabase storage. This script bypasses the Next.js API and processes the documents directly, which is faster and more reliable.

```bash
# Run with default settings (5 batches of 5 reports each)
npm run ingest:direct

# Customize batch size and number of batches
npm run ingest:direct -- --batch-size=10 --max-batches=20 --delay=3000
```

#### Command-line Arguments

- `--batch-size=<number>`: Number of reports to process in each batch (default: 5)
- `--max-batches=<number>`: Maximum number of batches to process (default: 5)
- `--delay=<number>`: Delay in milliseconds between batches (default: 5000)

### Bulk Ingestion (via API)

The `bulk-ingest.mjs` script uses the Next.js API to ingest PDFs. This is useful when you need to run the ingestion process in an environment where you can't run the direct ingestion script.

```bash
npm run ingest:bulk
```

## Testing Scripts

### Test Supabase Connection

Tests the connection to Supabase and verifies that your credentials are working.

```bash
npm run test:supabase
```

### Test Storage Access

Tests the access to Supabase storage and attempts to download a PDF file using different methods.

```bash
npm run test:storage
```

### Test Ingestion API

Tests the Next.js API endpoint for PDF ingestion.

```bash
npm run test:ingest:api
```

## Monitoring Progress

The ingestion script creates a log file named `direct-ingestion-log.json` in the project root. This file contains information about the ingestion process, including:

- Batches processed
- Reports processed/failed
- Chunk counts
- Error messages

You can monitor this file to track the progress of the ingestion process.

## Troubleshooting

### SSL Certificate Issues

If you encounter SSL certificate issues, the script will automatically disable certificate verification for testing purposes. This is not recommended for production use.

### Connection Issues

If you're having issues connecting to Supabase, try running the `test:supabase` script to verify your credentials.

### Storage Access Issues

If you're having issues downloading PDFs, try running the `test:storage` script to verify your storage configuration.

### OpenAI API Issues

Make sure your OpenAI API key is valid and has sufficient credits. 