const DEFAULT_MAX_SOL = Number(process.env.SOLGUARD_MAX_SOL ?? 1);

export function validateTransfer({ recipient, amountSol }) {
  const errors = [];
  if (!recipient || typeof recipient !== "string" || recipient.length < 32 || recipient.length > 44) errors.push("invalid recipient");
  if (!Number.isFinite(amountSol) || amountSol <= 0) errors.push("amount must be positive");
  if (amountSol > DEFAULT_MAX_SOL) errors.push(`amount exceeds policy limit of ${DEFAULT_MAX_SOL} SOL`);
  return { ok: errors.length === 0, errors, limitSol: DEFAULT_MAX_SOL };
}

export function approvalRequired() {
  return true;
}
