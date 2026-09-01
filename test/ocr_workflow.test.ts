import assert from "node:assert/strict";
import { scanRequest } from "../src/ocr_service.js";

const parsed = scanRequest.parse({ documentId: "receipt-42", pdf: "base64-pdf", lang: "eng" });
assert.equal(parsed.documentId, "receipt-42");
assert.equal(parsed.pdf, "base64-pdf");
assert.throws(() => scanRequest.parse({ documentId: "", pdf: "base64-pdf" }));
console.log("scan request validation passed");
