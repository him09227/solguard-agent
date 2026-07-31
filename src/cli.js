#!/usr/bin/env node
import { getBalance, getSignatures } from "./solana.js";
import { createPaymentRequest } from "./request.js";

const [command, ...args] = process.argv.slice(2);

function print(value) { console.log(JSON.stringify(value, null, 2)); }

try {
  if (command === "balance") {
    if (!args[0]) throw new Error("Usage: npm start -- balance <ADDRESS>");
    print(await getBalance(args[0]));
  } else if (command === "activity") {
    if (!args[0]) throw new Error("Usage: npm start -- activity <ADDRESS>");
    print(await getSignatures(args[0], Number(args[1] ?? 5)));
  } else if (command === "request") {
    const [recipient, amount, ...memo] = args;
    print(createPaymentRequest({ recipient, amountSol: Number(amount), memo: memo.join(" ") }));
  } else if (command === "check") {
    print({ name: "SolGuard", custody: "T1_NON_CUSTODIAL", signingKeysStored: false, broadcastingEnabled: false, humanApprovalRequired: true });
  } else {
    console.log("SolGuard commands: balance <address> | activity <address> [limit] | request <recipient> <SOL> [memo] | check");
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exitCode = 1;
}
