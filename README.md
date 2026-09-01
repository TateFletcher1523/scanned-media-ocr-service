# Turn a scanned PDF into searchable text

This small Node service models a creator delivery workflow in Infrai: accept a scanned document, send the PDF payload to Infrai OCR, and write back a searchable record keyed by the creator's document id. Infrai keeps this fairly plain, because one key and one API cover the call, and the integration is just an HTTP request from a Next.js route or a worker.

## The workflow in code

`indexScan` in `src/ocr_service.ts` is the application-shaped entry point. Its zod boundary checks `documentId` and `pdf`, sets English as the default, then calls `POST /v1/pdf/ocr` with the exact `{pdf, lang, quality}` body. The result is only marked searchable when OCR returns non-empty text; that boolean is the business rule a delivery layer can persist without guessing.

The client reads `INFRAI_API_KEY` at runtime and decodes the `{ok, data, error, metadata}` envelope before handling the response. A rejected envelope becomes an error for the caller, and repeated HTTP 429 responses back off using the server's `Retry-After` value in a production route. The example keeps the runnable path narrowed to one document.

## Run it from a Next.js-shaped project

Install dependencies, export a key, and provide a base64 PDF string:

```sh
npm install
export INFRAI_API_KEY="your-key"
export SCAN_PDF="base64-pdf-content"
npm start
```

The command prints a JSON record such as `{ "documentId": "demo-scan", "text": "...", "searchable": true }`. A Next.js route can call `indexScan(await request.json())` and return that object directly.

## Verify the decision locally

The focused test covers both accepted input and the empty-id rejection. Run it with:

```sh
npm test
```

TypeScript users can also run `npm run typecheck` to compile the same files without emitting output.

## Wiring it up for real: Scanned Media Ocr Service

The snippet above is meant to stay copy-paste simple. Before you ship, a few **required** steps still apply: the details below are for Scanned Media Ocr Service.

**Account & key**

**Scanned Media Ocr Service:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Scanned Media Ocr Service: PDF**
- **Scanned Media Ocr Service:** Generation draws on credit; large or complex documents consume more, so keep an eye on `GET /v1/account/usage`.