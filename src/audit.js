import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const AUDIT_PATH = process.env.SOLGUARD_AUDIT_PATH ?? path.join(process.cwd(), "data", "audit.jsonl");

function sanitize(value) {
  const text = JSON.stringify(value ?? {});
  return JSON.parse(text.replace(/(seed phrase|private key|secret key)/gi, "[REDACTED_TERM]"));
}

export function appendAudit(event, details = {}) {
  fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
  const entry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    event,
    details: sanitize(details)
  };
  fs.appendFileSync(AUDIT_PATH, `${JSON.stringify(entry)}\n`, { encoding: "utf8", mode: 0o600 });
  return entry;
}

export function readAudit(limit = 20) {
  if (!fs.existsSync(AUDIT_PATH)) return [];
  return fs.readFileSync(AUDIT_PATH, "utf8").trim().split("\n").filter(Boolean).slice(-limit).map(JSON.parse);
}
