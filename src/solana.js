const RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(body.error.message ?? "Solana RPC error");
  return body.result;
}

export async function getBalance(address) {
  const result = await rpc("getBalance", [address, { commitment: "confirmed" }]);
  return { lamports: result.value, sol: result.value / 1_000_000_000, rpc: RPC_URL };
}

export async function getSignatures(address, limit = 5) {
  return rpc("getSignaturesForAddress", [address, { limit }]);
}

export function explorerTx(signature) {
  const cluster = RPC_URL.includes("devnet") ? "?cluster=devnet" : RPC_URL.includes("testnet") ? "?cluster=testnet" : "";
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}
