import crypto from "node:crypto";
import { validateTransfer, approvalRequired } from "./policy.js";

export function createPaymentRequest({ recipient, amountSol, memo = "" }) {
  const policy = validateTransfer({ recipient, amountSol });
  if (!policy.ok) return { status: "rejected", policy };

  return {
    id: crypto.randomUUID(),
    status: "awaiting_human_approval",
    createdAt: new Date().toISOString(),
    action: "transfer_sol",
    recipient,
    amountSol,
    memo: String(memo).slice(0, 120),
    approvalRequired: approvalRequired(),
    custody: "T1_NON_CUSTODIAL",
    notice: "SolGuard never signs or broadcasts treasury transfers. Review and sign with your wallet."
  };
}
