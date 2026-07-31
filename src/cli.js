#!/usr/bin/env node
import { getBalance, getSignatures, verifyTransaction } from "./solana.js";
import { createPaymentRequest } from "./request.js";
import { appendAudit, readAudit } from "./audit.js";

const [command, ...args] = process.argv.slice(2);
function print(value) { console.log(JSON.stringify(value, null, 2)); }

try {
  if (command === "balance") {
    if (!args[0]) throw new Error("Usage: npm start -- balance <ADDRESS>");
    const result = await getBalance(args[0]);
    appendAudit("balance_checked", { address: args[0], sol: result.sol });
    print(result);
  } else if (command === "activity") {
    if (!args[0]) throw new Error("Usage: npm start -- activity <ADDRESS>");
    const result = await getSignatures(args[0], Number(args[1] ?? 5));
    appendAudit("activity_checked", { address: args[0], count: result.length });
    print(result);
  } else if (command === "request") {
    const [recipient, amount, ...memo] = args;
    const result = createPaymentRequest({ recipient, amountSol: Number(amount), memo: memo.join(" ") });
    appendAudit("payment_request", { recipient, amountSol: Number(amount), status: result.status });
    print(result);
  } else if (command === "verify") {
    if (!args[0]) throw new Error("Usage: npm start -- verify <SIGNATURE>");
    const result = await verifyTransaction(args[0]);
    appendAudit("transaction_verified", { signature: args[0], verified: result.verified, confirmationStatus: result.confirmationStatus });
    print(result);
  } else if (command === "audit") {
    print(readAudit(Number(args[0] ?? 20)));
  } else if (command === "check") {
    print({ name: "SolGuard", custody: "T1_NON_CUSTODIAL", signingKeysStored: false, broadcastingEnabled: false, humanApprovalRequired: true, auditTrail: true, independentVerification: true });
  } else {
    console.log("SolGuard commands: balance <address> | activity <address> [limit] | request <recipient> <SOL> [memo] | verify <signature> | audit [limit] | check");
  }
} catch (error) {
  appendAudit("error", { command, message: error.message });
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exitCode = 1;
}
