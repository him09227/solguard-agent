#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { getBalance, getSignatures } from "./solana.js";
import { appendAudit } from "./audit.js";

const address = process.argv[2] ?? process.env.SOLGUARD_TREASURY_ADDRESS;
const statePath = process.env.SOLGUARD_MONITOR_STATE ?? path.join(process.cwd(), "data", "monitor-state.json");

if (!address) {
  console.error("Usage: npm run monitor -- <TREASURY_ADDRESS> or set SOLGUARD_TREASURY_ADDRESS");
  process.exit(1);
}

function loadState() {
  if (!fs.existsSync(statePath)) return null;
  return JSON.parse(fs.readFileSync(statePath, "utf8"));
}

function saveState(state) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), { mode: 0o600 });
}

try {
  const [balance, signatures] = await Promise.all([getBalance(address), getSignatures(address, 10)]);
  const previous = loadState();
  const latestSignature = signatures[0]?.signature ?? null;
  const current = { address, checkedAt: new Date().toISOString(), lamports: balance.lamports, sol: balance.sol, latestSignature };
  const changes = [];

  if (previous) {
    if (previous.lamports !== current.lamports) {
      changes.push({ type: "BALANCE_CHANGED", beforeSol: previous.lamports / 1_000_000_000, afterSol: current.sol, deltaSol: (current.lamports - previous.lamports) / 1_000_000_000 });
    }
    if (latestSignature && latestSignature !== previous.latestSignature) {
      changes.push({ type: "NEW_ACTIVITY", signature: latestSignature });
    }
  } else {
    changes.push({ type: "BASELINE_CREATED", sol: current.sol, latestSignature });
  }

  saveState(current);
  appendAudit("treasury_monitor", { address, changes });
  console.log(JSON.stringify({ status: changes.length ? "changed" : "unchanged", current, changes }, null, 2));
} catch (error) {
  appendAudit("monitor_error", { address, message: error.message });
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exitCode = 1;
}
