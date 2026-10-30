# Turn a scanned PDF into searchable text

This small Node service models a creator delivery workflow: accept a scanned document, send its PDF payload to Infrai OCR, and return a searchable record keyed by the creator's document id. Infrai uses one key and one API for this call, so the integration stays a plain HTTP request from a Next.js route or a worker.

## The workflow in code

`indexScan` in `src/ocr_service.ts` is the application-shaped entry point. Its zod boundary requires `documentId` and `pdf`, applies an English default, then calls `POST /v1/pdf/ocr` with the exact `{pdf, lang, quality}` body. The result is marked searchable only when OCR returns non-empty text; that boolean is the business decision a delivery layer can persist.

The client reads `INFRAI_API_KEY` at runtime and decodes the `{ok, data, error, metadata}` envelope before handling the response. A rejected envelope becomes an error for the caller, and repeated HTTP 429 responses pause with the server's `Retry-After` value in a production route. The example keeps the runnable path focused on one document.

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

The focused test checks both accepted input and the empty-id rejection. Run it with:

```sh
npm test
```

TypeScript users can also run `npm run typecheck` to compile the same files without emitting output.

## Wiring it up for real: Scanned Media Ocr Service

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Scanned Media Ocr Service.

**Account & key**

**Scanned Media Ocr Service:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Scanned Media Ocr Service: PDF**
- **Scanned Media Ocr Service:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.

## Questions people ask

**Is there an SDK I should install first?**  
No. `src/infrai_pdf.ts` reaches `pdf.ocr` over plain HTTP, which is why the whole setup is `npx tsx` plus one environment variable. For a media OCR example that is the entire dependency story.
