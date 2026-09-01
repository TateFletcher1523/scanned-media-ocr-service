import { z } from "zod";
import { ocrPdf } from "./infrai_pdf.js";

export const scanRequest = z.object({ documentId: z.string().min(1), pdf: z.string().min(1), lang: z.string().default("eng") });
export type SearchableDocument = { documentId: string; text: string; searchable: boolean };

export async function indexScan(input: unknown): Promise<SearchableDocument> {
  const request = scanRequest.parse(input);
  const result = await ocrPdf(request.pdf, request.lang);
  return { documentId: request.documentId, text: result.text, searchable: result.text.trim().length > 0 };
}

if (process.argv[1]?.endsWith("ocr_service.ts")) {
  const body = { documentId: "demo-scan", pdf: process.env.SCAN_PDF ?? "", lang: "eng" };
  indexScan(body).then((doc) => console.log(JSON.stringify(doc, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
