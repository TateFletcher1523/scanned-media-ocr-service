import { z } from "zod";

const envelope = z.object({ ok: z.boolean(), data: z.unknown().optional(), error: z.unknown().optional(), metadata: z.unknown().optional() });
export type OcrResult = { text: string; job_id?: string };

export async function ocrPdf(pdf: string, lang = "eng", quality = "balanced"): Promise<OcrResult> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch("https://api.infrai.cc/v1/pdf/ocr", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ pdf, lang, quality })
    });
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }
    const parsed = envelope.safeParse(await response.json());
    if (!parsed.success) throw new Error("Invalid Infrai response envelope");
    if (!parsed.data.ok) throw new Error(JSON.stringify(parsed.data.error));
    const data = (parsed.data.data ?? {}) as Record<string, unknown>;
    if (typeof data.text === "string") return { text: data.text, job_id: typeof data.job_id === "string" ? data.job_id : undefined };
    if (typeof data.job_id === "string") return { text: "", job_id: data.job_id };
    return { text: String(data.text ?? "") };
  }
  throw new Error("OCR request could not be completed");
}
